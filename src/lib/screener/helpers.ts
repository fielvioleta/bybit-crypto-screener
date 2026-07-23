import type { Candle } from '@/lib/types';
import { calculateRsi } from '@/lib/indicators';
import { RSI_PERIOD } from '@/lib/screener/constants';

export function getCloses(candles: readonly Candle[]): number[] {
  return candles.map((candle) => candle.close);
}

export function getRsiForCandles(candles: readonly Candle[]): number {
  const rsi = calculateRsi(getCloses(candles), RSI_PERIOD);
  return rsi ?? Number.NaN;
}

export function getLatestCandleTimestamp(
  daily: readonly Candle[],
  h4: readonly Candle[],
  h1: readonly Candle[],
): number {
  const latest = [daily.at(-1)?.startTime, h4.at(-1)?.startTime, h1.at(-1)?.startTime].filter(
    (value): value is number => typeof value === 'number',
  );

  return latest.length > 0 ? Math.max(...latest) : 0;
}
