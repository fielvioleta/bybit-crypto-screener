/** Screening thresholds and scanner configuration. */

export const RSI_PERIOD = 14;

/** Minimum rolling 24h USDT turnover from Bybit tickers (momentum mode). */
export const VOLUME_24H_MIN_USDT = 10_000_000;

/** Softer volume floor for early / C-hunt assist mode. */
export const EARLY_VOLUME_24H_MIN_USDT = 3_000_000;

/** Long (momentum) RSI thresholds — all must be exceeded. */
export const LONG_DAILY_RSI_MIN = 65;
export const LONG_H4_RSI_MIN = 65;
export const LONG_H1_RSI_MIN = 70;

/** Short (oversold) RSI thresholds — all must be under. */
export const SHORT_DAILY_RSI_MAX = 35;
export const SHORT_H4_RSI_MAX = 35;
export const SHORT_H1_RSI_MAX = 30;

/** Early / C-hunt long mid-reclaim bands (inclusive). */
export const EARLY_LONG_DAILY_RSI_MIN = 48;
export const EARLY_LONG_DAILY_RSI_MAX = 62;
export const EARLY_LONG_H4_RSI_MIN = 50;
export const EARLY_LONG_H4_RSI_MAX = 65;
export const EARLY_LONG_H1_RSI_MIN = 50;
export const EARLY_LONG_H1_RSI_MAX = 68;

/** Early short mid-band (inclusive) — reclaim from oversold, not already extended. */
export const EARLY_SHORT_DAILY_RSI_MIN = 38;
export const EARLY_SHORT_DAILY_RSI_MAX = 52;
export const EARLY_SHORT_H4_RSI_MIN = 35;
export const EARLY_SHORT_H4_RSI_MAX = 50;
export const EARLY_SHORT_H1_RSI_MIN = 32;
export const EARLY_SHORT_H1_RSI_MAX = 50;

/** RSI highlight bands for strongest long / short readings. */
export const STRONG_LONG_RSI_HIGHLIGHT = 75;
export const STRONG_SHORT_RSI_HIGHLIGHT = 25;

/** @deprecated Use LONG_* constants. Kept for compatibility. */
export const DAILY_RSI_MIN = LONG_DAILY_RSI_MIN;
/** @deprecated Use LONG_* constants. */
export const H4_RSI_MIN = LONG_H4_RSI_MIN;
/** @deprecated Use LONG_* constants. */
export const H1_RSI_MIN = LONG_H1_RSI_MIN;
/** @deprecated Use STRONG_LONG_RSI_HIGHLIGHT. */
export const STRONG_RSI_HIGHLIGHT = STRONG_LONG_RSI_HIGHLIGHT;

export const SCAN_INTERVAL_MS = 60_000;

/** Available auto-refresh intervals (user selectable). */
export const REFRESH_INTERVAL_OPTIONS = [
  { minutes: 1, label: '1 min', ms: 60_000 },
  { minutes: 5, label: '5 min', ms: 5 * 60_000 },
  { minutes: 15, label: '15 min', ms: 15 * 60_000 },
] as const;

export type RefreshIntervalMinutes = (typeof REFRESH_INTERVAL_OPTIONS)[number]['minutes'];

export const DEFAULT_REFRESH_INTERVAL_MINUTES: RefreshIntervalMinutes = 5;

export const REFRESH_INTERVAL_STORAGE_KEY = 'crypto-screener-refresh-interval';

export function isRefreshIntervalMinutes(value: number): value is RefreshIntervalMinutes {
  return REFRESH_INTERVAL_OPTIONS.some((option) => option.minutes === value);
}

export function getRefreshIntervalMs(minutes: RefreshIntervalMinutes): number {
  const option = REFRESH_INTERVAL_OPTIONS.find((item) => item.minutes === minutes);
  return option?.ms ?? DEFAULT_REFRESH_INTERVAL_MINUTES * 60_000;
}

export function formatRefreshIntervalLabel(minutes: RefreshIntervalMinutes): string {
  const option = REFRESH_INTERVAL_OPTIONS.find((item) => item.minutes === minutes);
  return option?.label ?? `${minutes} min`;
}
export const KLINE_LIMIT = 100;

/** Max concurrent Bybit requests to stay under public rate limits. */
export const REQUEST_CONCURRENCY = 8;

export const REQUEST_MAX_RETRIES = 3;
export const REQUEST_RETRY_BASE_DELAY_MS = 400;

export const BYBIT_BASE_URL = 'https://api.bybit.com';
export const BYBIT_CATEGORY = 'linear' as const;

export const TIMEFRAME = {
  DAILY: 'D',
  H4: '240',
  H1: '60',
} as const;

export type StrategyDirection = 'long' | 'short';

/** Momentum = late continuation; Early = C-hunt assist mid-RSI band. */
export type ScanProfile = 'momentum' | 'early';

export const STRATEGY_DIRECTIONS: readonly StrategyDirection[] = ['long', 'short'] as const;

export const SCAN_PROFILES: readonly ScanProfile[] = ['momentum', 'early'] as const;

export const SCAN_PROFILE_STORAGE_KEY = 'crypto-screener-scan-profile';

export function isStrategyDirection(value: string): value is StrategyDirection {
  return value === 'long' || value === 'short';
}

export function isScanProfile(value: string): value is ScanProfile {
  return value === 'momentum' || value === 'early';
}
