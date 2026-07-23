import { bybitClient, type TickerSnapshot } from '@/lib/bybit';
import { createLongStrategy, type Strategy } from '@/lib/rules';
import type { Candle, ScanProgress, ScanResult, ScreenerMatch, SymbolData } from '@/lib/types';
import { mapWithConcurrency } from '@/lib/utils';
import { KLINE_LIMIT, REQUEST_CONCURRENCY, TIMEFRAME, VOLUME_24H_MIN_USDT } from './constants';
import { getLatestCandleTimestamp, getRsiForCandles } from './helpers';
import type { ScanThresholds } from './scan-thresholds';

export type ProgressCallback = (progress: ScanProgress) => void;

interface DailyStageResult {
  symbol: string;
  currentPrice: number;
  dailyCandles: Candle[];
  volume24h: number;
  dailyRsi: number;
}

function buildSymbolData(
  daily: DailyStageResult,
  h4Candles: Candle[],
  h1Candles: Candle[],
  scannedAt: number,
): SymbolData {
  return {
    symbol: daily.symbol,
    currentPrice: daily.currentPrice,
    volume24h: daily.volume24h,
    dailyRsi: daily.dailyRsi,
    h4Rsi: getRsiForCandles(h4Candles),
    h1Rsi: getRsiForCandles(h1Candles),
    dailyCandles: [...daily.dailyCandles],
    h4Candles,
    h1Candles,
    latestCandleTimestamp: getLatestCandleTimestamp(daily.dailyCandles, h4Candles, h1Candles),
    scannedAt,
  };
}

async function fetchDailyStage(
  symbol: string,
  ticker: TickerSnapshot,
): Promise<DailyStageResult | null> {
  try {
    const dailyCandles = await bybitClient.getKlines(symbol, TIMEFRAME.DAILY, KLINE_LIMIT);
    if (dailyCandles.length < RSI_SAFE_CANDLE_COUNT) {
      return null;
    }

    return {
      symbol,
      currentPrice: ticker.lastPrice || dailyCandles.at(-1)?.close || 0,
      dailyCandles,
      volume24h: ticker.turnover24h,
      dailyRsi: getRsiForCandles(dailyCandles),
    };
  } catch {
    return null;
  }
}

/** RSI(14) needs at least period + 1 closes. */
const RSI_SAFE_CANDLE_COUNT = 15;

async function enrichWithIntraday(daily: DailyStageResult): Promise<{
  h4Candles: Candle[];
  h1Candles: Candle[];
} | null> {
  try {
    const [h4Candles, h1Candles] = await Promise.all([
      bybitClient.getKlines(daily.symbol, TIMEFRAME.H4, KLINE_LIMIT),
      bybitClient.getKlines(daily.symbol, TIMEFRAME.H1, KLINE_LIMIT),
    ]);

    if (h4Candles.length < RSI_SAFE_CANDLE_COUNT || h1Candles.length < RSI_SAFE_CANDLE_COUNT) {
      return null;
    }

    return { h4Candles, h1Candles };
  } catch {
    return null;
  }
}

/**
 * Scans all Bybit USDT perpetuals against the provided strategy.
 * Uses live 24h turnover from tickers, then daily/intraday RSI checks.
 */
export async function runScreenerScan(
  strategy: Strategy = createLongStrategy(),
  onProgress?: ProgressCallback,
  thresholds?: Pick<ScanThresholds, 'volume24hMin'>,
): Promise<ScanResult> {
  const startedAt = Date.now();
  let failedSymbols = 0;
  const volume24hMin = thresholds?.volume24hMin ?? VOLUME_24H_MIN_USDT;

  onProgress?.({
    status: 'scanning',
    scanned: 0,
    total: 0,
    message: 'Loading symbols...',
  });

  const [symbols, tickerMap] = await Promise.all([
    bybitClient.getSymbols(),
    bybitClient.getTicker(),
  ]);

  const total = symbols.length;

  const liquidSymbols = symbols.filter((symbol) => {
    const ticker = tickerMap.get(symbol);
    return (ticker?.turnover24h ?? 0) >= volume24hMin;
  });

  onProgress?.({
    status: 'scanning',
    scanned: 0,
    total: liquidSymbols.length,
    message: `Scanning daily data... 0 / ${liquidSymbols.length} liquid symbols`,
  });

  const dailyResults = await mapWithConcurrency(
    liquidSymbols,
    REQUEST_CONCURRENCY,
    async (symbol) => {
      const ticker = tickerMap.get(symbol);
      if (!ticker) {
        return null;
      }
      return fetchDailyStage(symbol, ticker);
    },
    (scanned, totalCount) => {
      onProgress?.({
        status: 'scanning',
        scanned,
        total: totalCount,
        message: `Scanning daily data... ${scanned} / ${totalCount} liquid symbols`,
      });
    },
  );

  const successfulDaily: DailyStageResult[] = [];
  for (const result of dailyResults) {
    if (result === null) {
      failedSymbols += 1;
    } else {
      successfulDaily.push(result);
    }
  }

  const candidates = successfulDaily.filter((item) =>
    strategy.dailyPrefilter(item.volume24h, item.dailyRsi),
  );

  onProgress?.({
    status: 'scanning',
    scanned: 0,
    total: candidates.length,
    message:
      candidates.length === 0
        ? 'No daily candidates. Finishing...'
        : `Scanning intraday data... 0 / ${candidates.length} candidates`,
  });

  const scannedAt = Date.now();
  const matches: ScreenerMatch[] = [];

  if (candidates.length > 0) {
    const enriched = await mapWithConcurrency(
      candidates,
      REQUEST_CONCURRENCY,
      async (daily) => {
        const intraday = await enrichWithIntraday(daily);
        if (!intraday) {
          return null;
        }
        return buildSymbolData(daily, intraday.h4Candles, intraday.h1Candles, scannedAt);
      },
      (scanned, totalCount) => {
        onProgress?.({
          status: 'scanning',
          scanned,
          total: totalCount,
          message: `Scanning intraday data... ${scanned} / ${totalCount} candidates`,
        });
      },
    );

    for (const symbolData of enriched) {
      if (symbolData === null) {
        failedSymbols += 1;
        continue;
      }

      if (strategy.evaluate(symbolData)) {
        matches.push(symbolData);
      }
    }
  }

  matches.sort((a, b) => b.volume24h - a.volume24h);

  const result: ScanResult = {
    matches,
    totalSymbols: total,
    scannedSymbols: successfulDaily.length,
    failedSymbols,
    scannedAt,
    durationMs: Date.now() - startedAt,
  };

  onProgress?.({
    status: 'completed',
    scanned: total,
    total,
    message: `Scan complete — ${matches.length} match${matches.length === 1 ? '' : 'es'}`,
  });

  return result;
}
