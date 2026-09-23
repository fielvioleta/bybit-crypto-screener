import {
  LONG_DAILY_RSI_MIN,
  LONG_H1_RSI_MIN,
  LONG_H4_RSI_MIN,
  SHORT_DAILY_RSI_MAX,
  SHORT_H1_RSI_MAX,
  SHORT_H4_RSI_MAX,
  VOLUME_24H_MIN_USDT,
  type StrategyDirection,
} from './constants';

/** Editable scan filters for volume + RSI thresholds. */
export interface ScanThresholds {
  volume24hMin: number;
  dailyRsi: number;
  h4Rsi: number;
  h1Rsi: number;
}

export const SCAN_THRESHOLDS_STORAGE_KEY = 'crypto-screener-scan-thresholds';

export function getDefaultThresholds(direction: StrategyDirection): ScanThresholds {
  if (direction === 'short') {
    return {
      volume24hMin: VOLUME_24H_MIN_USDT,
      dailyRsi: SHORT_DAILY_RSI_MAX,
      h4Rsi: SHORT_H4_RSI_MAX,
      h1Rsi: SHORT_H1_RSI_MAX,
    };
  }

  return {
    volume24hMin: VOLUME_24H_MIN_USDT,
    dailyRsi: LONG_DAILY_RSI_MIN,
    h4Rsi: LONG_H4_RSI_MIN,
    h1Rsi: LONG_H1_RSI_MIN,
  };
}

function clampRsi(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
}

function sanitizeVolume(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return VOLUME_24H_MIN_USDT;
  }
  return value;
}

export function normalizeThresholds(
  direction: StrategyDirection,
  partial?: Partial<ScanThresholds> | null,
): ScanThresholds {
  const defaults = getDefaultThresholds(direction);
  if (!partial) {
    return defaults;
  }

  return {
    volume24hMin: sanitizeVolume(
      partial.volume24hMin === undefined ? defaults.volume24hMin : partial.volume24hMin,
    ),
    dailyRsi: clampRsi(partial.dailyRsi === undefined ? defaults.dailyRsi : partial.dailyRsi),
    h4Rsi: clampRsi(partial.h4Rsi === undefined ? defaults.h4Rsi : partial.h4Rsi),
    h1Rsi: clampRsi(partial.h1Rsi === undefined ? defaults.h1Rsi : partial.h1Rsi),
  };
}

export function thresholdsEqual(a: ScanThresholds, b: ScanThresholds): boolean {
  return (
    a.volume24hMin === b.volume24hMin &&
    a.dailyRsi === b.dailyRsi &&
    a.h4Rsi === b.h4Rsi &&
    a.h1Rsi === b.h1Rsi
  );
}

export function parseThresholdsFromSearchParams(
  direction: StrategyDirection,
  searchParams: URLSearchParams,
): ScanThresholds {
  const defaults = getDefaultThresholds(direction);

  const readNumber = (key: string, fallback: number): number => {
    const raw = searchParams.get(key);
    if (raw === null || raw === '') {
      return fallback;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return normalizeThresholds(direction, {
    volume24hMin: readNumber('volume', defaults.volume24hMin),
    dailyRsi: readNumber('dailyRsi', defaults.dailyRsi),
    h4Rsi: readNumber('h4Rsi', defaults.h4Rsi),
    h1Rsi: readNumber('h1Rsi', defaults.h1Rsi),
  });
}

export function thresholdsToSearchParams(thresholds: ScanThresholds): URLSearchParams {
  const params = new URLSearchParams();
  params.set('volume', String(thresholds.volume24hMin));
  params.set('dailyRsi', String(thresholds.dailyRsi));
  params.set('h4Rsi', String(thresholds.h4Rsi));
  params.set('h1Rsi', String(thresholds.h1Rsi));
  return params;
}

export type StoredScanThresholds = Partial<Record<StrategyDirection, ScanThresholds>>;
