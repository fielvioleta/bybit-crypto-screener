import { bybitClient } from '@/lib/bybit';
import {
  BTC_SYMBOL,
  buildTimeframeBias,
  cueLabel,
  resolveLongCue,
  type BtcBiasSnapshot,
} from './index';
import { KLINE_LIMIT, TIMEFRAME } from '@/lib/screener/constants';
import { getRsiForCandles } from '@/lib/screener/helpers';

export async function fetchBtcBiasSnapshot(): Promise<BtcBiasSnapshot> {
  const [dailyCandles, h4Candles, h1Candles] = await Promise.all([
    bybitClient.getKlines(BTC_SYMBOL, TIMEFRAME.DAILY, KLINE_LIMIT),
    bybitClient.getKlines(BTC_SYMBOL, TIMEFRAME.H4, KLINE_LIMIT),
    bybitClient.getKlines(BTC_SYMBOL, TIMEFRAME.H1, KLINE_LIMIT),
  ]);

  const daily = buildTimeframeBias('Daily', getRsiForCandles(dailyCandles));
  const h4 = buildTimeframeBias('4H', getRsiForCandles(h4Candles));
  const h1 = buildTimeframeBias('1H', getRsiForCandles(h1Candles));
  const cue = resolveLongCue(daily.bias, h4.bias);

  const lastPrice =
    h1Candles.at(-1)?.close ?? h4Candles.at(-1)?.close ?? dailyCandles.at(-1)?.close ?? Number.NaN;

  return {
    symbol: BTC_SYMBOL,
    lastPrice,
    h1,
    h4,
    daily,
    cue,
    cueLabel: cueLabel(cue),
    updatedAt: Date.now(),
  };
}
