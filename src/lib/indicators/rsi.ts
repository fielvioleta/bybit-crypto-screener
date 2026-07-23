/**
 * Wilder's Relative Strength Index (RSI).
 *
 * First average gain/loss uses a simple average of the first `period` changes.
 * Subsequent averages use Wilder's smoothing:
 *   avg = (prevAvg * (period - 1) + current) / period
 */
export function calculateRsi(closes: readonly number[], period: number): number | null {
  if (period <= 0) {
    throw new Error('RSI period must be positive');
  }

  if (closes.length < period + 1) {
    return null;
  }

  let gainSum = 0;
  let lossSum = 0;

  for (let i = 1; i <= period; i += 1) {
    const change = closes[i] - closes[i - 1];
    if (change >= 0) {
      gainSum += change;
    } else {
      lossSum += Math.abs(change);
    }
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;

  for (let i = period + 1; i < closes.length; i += 1) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) {
    return 100;
  }

  const relativeStrength = avgGain / avgLoss;
  return 100 - 100 / (1 + relativeStrength);
}

/** Placeholder exports for future indicator modules. */
export const indicators = {
  rsi: calculateRsi,
  // ema, macd, atr, vwap, volumeAverage — add here as modules are introduced
} as const;
