import {
  BYBIT_CATEGORY,
  REQUEST_MAX_RETRIES,
  REQUEST_RETRY_BASE_DELAY_MS,
} from '@/lib/screener/constants';
import type { Candle, Timeframe } from '@/lib/types';
import { withRetry } from '@/lib/utils';
import { BYBIT_ENDPOINTS } from './endpoints';
import type {
  BybitApiResponse,
  BybitInstrumentsResult,
  BybitKlineRow,
  BybitKlinesResult,
  BybitTickersResult,
} from './types';
import type { TickerSnapshot } from './ticker';

function isRateLimitError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.message.includes('rate limit') || error.message.includes('10006');
}

async function fetchBybit<T>(url: string): Promise<T> {
  return withRetry(
    async () => {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      if (response.status === 429) {
        throw new Error('Bybit rate limit (HTTP 429)');
      }

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            'Bybit HTTP 403: Forbidden (geo-blocked). Deploy outside US/CN — e.g. Vercel region sin1.',
          );
        }
        throw new Error(`Bybit HTTP ${response.status}: ${response.statusText}`);
      }

      const payload = (await response.json()) as BybitApiResponse<T>;

      if (payload.retCode !== 0) {
        throw new Error(`Bybit API error ${payload.retCode}: ${payload.retMsg}`);
      }

      return payload.result;
    },
    {
      maxRetries: REQUEST_MAX_RETRIES,
      baseDelayMs: REQUEST_RETRY_BASE_DELAY_MS,
      shouldRetry: (error) => isRateLimitError(error) || error instanceof TypeError,
    },
  );
}

function parseCandle(row: BybitKlineRow): Candle {
  return {
    startTime: Number(row[0]),
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5]),
    turnover: Number(row[6]),
  };
}

/**
 * Bybit returns klines newest-first. Normalize to oldest-first for indicators.
 */
function normalizeKlines(rows: BybitKlineRow[]): Candle[] {
  return rows.map(parseCandle).sort((a, b) => a.startTime - b.startTime);
}

export async function getSymbols(): Promise<string[]> {
  const symbols: string[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({
      category: BYBIT_CATEGORY,
      status: 'Trading',
      limit: '1000',
    });

    if (cursor) {
      params.set('cursor', cursor);
    }

    const result = await fetchBybit<BybitInstrumentsResult>(
      `${BYBIT_ENDPOINTS.instrumentsInfo}?${params.toString()}`,
    );

    for (const instrument of result.list) {
      const isUsdtPerpetual =
        instrument.settleCoin === 'USDT' &&
        instrument.contractType === 'LinearPerpetual' &&
        instrument.status === 'Trading';

      if (isUsdtPerpetual) {
        symbols.push(instrument.symbol);
      }
    }

    cursor = result.nextPageCursor || undefined;
  } while (cursor);

  return symbols.sort((a, b) => a.localeCompare(b));
}

export async function getKlines(
  symbol: string,
  interval: Timeframe,
  limit: number,
): Promise<Candle[]> {
  const params = new URLSearchParams({
    category: BYBIT_CATEGORY,
    symbol,
    interval,
    limit: String(limit),
  });

  const result = await fetchBybit<BybitKlinesResult>(
    `${BYBIT_ENDPOINTS.kline}?${params.toString()}`,
  );

  return normalizeKlines(result.list);
}

export async function getTicker(symbol?: string): Promise<Map<string, TickerSnapshot>> {
  const params = new URLSearchParams({
    category: BYBIT_CATEGORY,
  });

  if (symbol) {
    params.set('symbol', symbol);
  }

  const result = await fetchBybit<BybitTickersResult>(
    `${BYBIT_ENDPOINTS.tickers}?${params.toString()}`,
  );

  const tickers = new Map<string, TickerSnapshot>();
  for (const ticker of result.list) {
    tickers.set(ticker.symbol, {
      lastPrice: Number(ticker.lastPrice),
      turnover24h: Number(ticker.turnover24h),
    });
  }
  return tickers;
}

export const bybitClient = {
  getSymbols,
  getKlines,
  getTicker,
};
