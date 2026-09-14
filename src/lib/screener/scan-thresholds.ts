import {
  EARLY_LONG_DAILY_RSI_MAX,
  EARLY_LONG_DAILY_RSI_MIN,
  EARLY_LONG_H1_RSI_MAX,
  EARLY_LONG_H1_RSI_MIN,
  EARLY_LONG_H4_RSI_MAX,
  EARLY_LONG_H4_RSI_MIN,
  EARLY_SHORT_DAILY_RSI_MAX,
  EARLY_SHORT_DAILY_RSI_MIN,
  EARLY_SHORT_H1_RSI_MAX,
  EARLY_SHORT_H1_RSI_MIN,
  EARLY_SHORT_H4_RSI_MAX,
  EARLY_SHORT_H4_RSI_MIN,
  EARLY_VOLUME_24H_MIN_USDT,
  LONG_DAILY_RSI_MIN,
  LONG_H1_RSI_MIN,
  LONG_H4_RSI_MIN,
  SHORT_DAILY_RSI_MAX,
  SHORT_H1_RSI_MAX,
  SHORT_H4_RSI_MAX,
  VOLUME_24H_MIN_USDT,
  type ScanProfile,
  type StrategyDirection,
} from './constants';

/**
 * Editable scan filters.
 * - Momentum long: RSI >= *Rsi (max fields unused / 100)
 * - Momentum short: RSI <= *Rsi (min fields unused / 0) — stored in *Rsi as the ceiling
 * - Early: RSI between *RsiMin and *RsiMax inclusive
 *
 * Unified shape: floor + ceil for each TF.
 * Momentum long: floor=threshold, ceil=100
 * Momentum short: floor=0, ceil=threshold
 * Early: both ends set to the mid band
 */
export interface ScanThresholds {
  volume24hMin: number;
  dailyRsiMin: number;
  dailyRsiMax: number;
  h4RsiMin: number;
  h4RsiMax: number;
  h1RsiMin: number;
  h1RsiMax: number;
}

export const SCAN_THRESHOLDS_STORAGE_KEY = 'crypto-screener-scan-thresholds-v2';

export function storageKeyFor(direction: StrategyDirection, profile: ScanProfile): string {
  return `${direction}:${profile}`;
}

export function getDefaultThresholds(
  direction: StrategyDirection,
  profile: ScanProfile = 'momentum',
): ScanThresholds {
  if (profile === 'early') {
    if (direction === 'short') {
      return {
        volume24hMin: EARLY_VOLUME_24H_MIN_USDT,
        dailyRsiMin: EARLY_SHORT_DAILY_RSI_MIN,
        dailyRsiMax: EARLY_SHORT_DAILY_RSI_MAX,
        h4RsiMin: EARLY_SHORT_H4_RSI_MIN,
        h4RsiMax: EARLY_SHORT_H4_RSI_MAX,
        h1RsiMin: EARLY_SHORT_H1_RSI_MIN,
        h1RsiMax: EARLY_SHORT_H1_RSI_MAX,
      };
    }
    return {
      volume24hMin: EARLY_VOLUME_24H_MIN_USDT,
      dailyRsiMin: EARLY_LONG_DAILY_RSI_MIN,
      dailyRsiMax: EARLY_LONG_DAILY_RSI_MAX,
      h4RsiMin: EARLY_LONG_H4_RSI_MIN,
      h4RsiMax: EARLY_LONG_H4_RSI_MAX,
      h1RsiMin: EARLY_LONG_H1_RSI_MIN,
      h1RsiMax: EARLY_LONG_H1_RSI_MAX,
    };
  }

  if (direction === 'short') {
    return {
      volume24hMin: VOLUME_24H_MIN_USDT,
      dailyRsiMin: 0,
      dailyRsiMax: SHORT_DAILY_RSI_MAX,
      h4RsiMin: 0,
      h4RsiMax: SHORT_H4_RSI_MAX,
      h1RsiMin: 0,
      h1RsiMax: SHORT_H1_RSI_MAX,
    };
  }

  return {
    volume24hMin: VOLUME_24H_MIN_USDT,
    dailyRsiMin: LONG_DAILY_RSI_MIN,
    dailyRsiMax: 100,
    h4RsiMin: LONG_H4_RSI_MIN,
    h4RsiMax: 100,
    h1RsiMin: LONG_H1_RSI_MIN,
    h1RsiMax: 100,
  };
}

function clampRsi(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
}

function sanitizeVolume(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return fallback;
  }
  return value;
}

function orderedBand(min: number, max: number): { min: number; max: number } {
  const a = clampRsi(min);
  const b = clampRsi(max);
  return a <= b ? { min: a, max: b } : { min: b, max: a };
}

export function normalizeThresholds(
  direction: StrategyDirection,
  profile: ScanProfile,
  partial?: Partial<ScanThresholds> | null,
): ScanThresholds {
  const defaults = getDefaultThresholds(direction, profile);
  if (!partial) {
    return defaults;
  }

  const daily = orderedBand(
    partial.dailyRsiMin === undefined ? defaults.dailyRsiMin : partial.dailyRsiMin,
    partial.dailyRsiMax === undefined ? defaults.dailyRsiMax : partial.dailyRsiMax,
  );
  const h4 = orderedBand(
    partial.h4RsiMin === undefined ? defaults.h4RsiMin : partial.h4RsiMin,
    partial.h4RsiMax === undefined ? defaults.h4RsiMax : partial.h4RsiMax,
  );
  const h1 = orderedBand(
    partial.h1RsiMin === undefined ? defaults.h1RsiMin : partial.h1RsiMin,
    partial.h1RsiMax === undefined ? defaults.h1RsiMax : partial.h1RsiMax,
  );

  return {
    volume24hMin: sanitizeVolume(
      partial.volume24hMin === undefined ? defaults.volume24hMin : partial.volume24hMin,
      defaults.volume24hMin,
    ),
    dailyRsiMin: daily.min,
    dailyRsiMax: daily.max,
    h4RsiMin: h4.min,
    h4RsiMax: h4.max,
    h1RsiMin: h1.min,
    h1RsiMax: h1.max,
  };
}

export function thresholdsEqual(a: ScanThresholds, b: ScanThresholds): boolean {
  return (
    a.volume24hMin === b.volume24hMin &&
    a.dailyRsiMin === b.dailyRsiMin &&
    a.dailyRsiMax === b.dailyRsiMax &&
    a.h4RsiMin === b.h4RsiMin &&
    a.h4RsiMax === b.h4RsiMax &&
    a.h1RsiMin === b.h1RsiMin &&
    a.h1RsiMax === b.h1RsiMax
  );
}

export function parseThresholdsFromSearchParams(
  direction: StrategyDirection,
  profile: ScanProfile,
  searchParams: URLSearchParams,
): ScanThresholds {
  const defaults = getDefaultThresholds(direction, profile);

  const readNumber = (key: string, fallback: number): number => {
    const raw = searchParams.get(key);
    if (raw === null || raw === '') {
      return fallback;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  // Backward-compat: old single dailyRsi/h4Rsi/h1Rsi query keys
  const legacyDaily = searchParams.get('dailyRsi');
  const legacyH4 = searchParams.get('h4Rsi');
  const legacyH1 = searchParams.get('h1Rsi');

  let dailyMin = readNumber('dailyRsiMin', defaults.dailyRsiMin);
  let dailyMax = readNumber('dailyRsiMax', defaults.dailyRsiMax);
  let h4Min = readNumber('h4RsiMin', defaults.h4RsiMin);
  let h4Max = readNumber('h4RsiMax', defaults.h4RsiMax);
  let h1Min = readNumber('h1RsiMin', defaults.h1RsiMin);
  let h1Max = readNumber('h1RsiMax', defaults.h1RsiMax);

  if (legacyDaily !== null && searchParams.get('dailyRsiMin') === null) {
    const value = Number(legacyDaily);
    if (Number.isFinite(value)) {
      if (direction === 'short' && profile === 'momentum') {
        dailyMin = 0;
        dailyMax = value;
      } else if (profile === 'momentum') {
        dailyMin = value;
        dailyMax = 100;
      }
    }
  }
  if (legacyH4 !== null && searchParams.get('h4RsiMin') === null) {
    const value = Number(legacyH4);
    if (Number.isFinite(value)) {
      if (direction === 'short' && profile === 'momentum') {
        h4Min = 0;
        h4Max = value;
      } else if (profile === 'momentum') {
        h4Min = value;
        h4Max = 100;
      }
    }
  }
  if (legacyH1 !== null && searchParams.get('h1RsiMin') === null) {
    const value = Number(legacyH1);
    if (Number.isFinite(value)) {
      if (direction === 'short' && profile === 'momentum') {
        h1Min = 0;
        h1Max = value;
      } else if (profile === 'momentum') {
        h1Min = value;
        h1Max = 100;
      }
    }
  }

  return normalizeThresholds(direction, profile, {
    volume24hMin: readNumber('volume', defaults.volume24hMin),
    dailyRsiMin: dailyMin,
    dailyRsiMax: dailyMax,
    h4RsiMin: h4Min,
    h4RsiMax: h4Max,
    h1RsiMin: h1Min,
    h1RsiMax: h1Max,
  });
}

export function thresholdsToSearchParams(thresholds: ScanThresholds): URLSearchParams {
  const params = new URLSearchParams();
  params.set('volume', String(thresholds.volume24hMin));
  params.set('dailyRsiMin', String(thresholds.dailyRsiMin));
  params.set('dailyRsiMax', String(thresholds.dailyRsiMax));
  params.set('h4RsiMin', String(thresholds.h4RsiMin));
  params.set('h4RsiMax', String(thresholds.h4RsiMax));
  params.set('h1RsiMin', String(thresholds.h1RsiMin));
  params.set('h1RsiMax', String(thresholds.h1RsiMax));
  return params;
}

export type StoredScanThresholds = Partial<Record<string, ScanThresholds>>;

export function inRsiBand(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}
