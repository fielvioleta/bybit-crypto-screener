import type { ScanProfile, StrategyDirection } from '@/lib/screener/constants';
import {
  getDefaultThresholds,
  inRsiBand,
  normalizeThresholds,
  type ScanThresholds,
} from '@/lib/screener/scan-thresholds';
import type { Rule } from './rule';
import { Strategy } from './strategy';

function createVolumeRule(volume24hMin: number): Rule {
  return {
    id: 'volume-24h',
    name: `24H Volume >= ${volume24hMin.toLocaleString()} USDT`,
    evaluate(data) {
      return data.volume24h >= volume24hMin;
    },
  };
}

function formatBand(min: number, max: number): string {
  if (min <= 0 && max < 100) {
    return `<= ${max}`;
  }
  if (max >= 100) {
    return `>= ${min}`;
  }
  return `${min}–${max}`;
}

function createBandRules(thresholds: ScanThresholds): Rule[] {
  return [
    createVolumeRule(thresholds.volume24hMin),
    {
      id: 'daily-rsi-band',
      name: `Daily RSI(14) ${formatBand(thresholds.dailyRsiMin, thresholds.dailyRsiMax)}`,
      evaluate(data) {
        return inRsiBand(data.dailyRsi, thresholds.dailyRsiMin, thresholds.dailyRsiMax);
      },
    },
    {
      id: 'h4-rsi-band',
      name: `4H RSI(14) ${formatBand(thresholds.h4RsiMin, thresholds.h4RsiMax)}`,
      evaluate(data) {
        return inRsiBand(data.h4Rsi, thresholds.h4RsiMin, thresholds.h4RsiMax);
      },
    },
    {
      id: 'h1-rsi-band',
      name: `1H RSI(14) ${formatBand(thresholds.h1RsiMin, thresholds.h1RsiMax)}`,
      evaluate(data) {
        return inRsiBand(data.h1Rsi, thresholds.h1RsiMin, thresholds.h1RsiMax);
      },
    },
  ];
}

function strategyMeta(
  direction: StrategyDirection,
  profile: ScanProfile,
): { id: string; name: string } {
  if (profile === 'early') {
    return direction === 'short'
      ? {
          id: 'early-short',
          name: 'Early Short / C-hunt Assist',
        }
      : {
          id: 'early-long',
          name: 'Early Long / C-hunt Assist',
        };
  }

  return direction === 'short'
    ? {
        id: 'momentum-short',
        name: 'Short Continuation / Confirmation',
      }
    : {
        id: 'momentum-long',
        name: 'Long Continuation / Confirmation',
      };
}

export function createLongStrategy(
  thresholds?: Partial<ScanThresholds>,
  profile: ScanProfile = 'momentum',
): Strategy {
  const resolved = normalizeThresholds('long', profile, thresholds);
  const meta = strategyMeta('long', profile);
  return new Strategy(
    meta.id,
    meta.name,
    createBandRules(resolved),
    (volume24h, dailyRsi) =>
      volume24h >= resolved.volume24hMin &&
      inRsiBand(dailyRsi, resolved.dailyRsiMin, resolved.dailyRsiMax),
  );
}

export function createShortStrategy(
  thresholds?: Partial<ScanThresholds>,
  profile: ScanProfile = 'momentum',
): Strategy {
  const resolved = normalizeThresholds('short', profile, thresholds);
  const meta = strategyMeta('short', profile);
  return new Strategy(
    meta.id,
    meta.name,
    createBandRules(resolved),
    (volume24h, dailyRsi) =>
      volume24h >= resolved.volume24hMin &&
      inRsiBand(dailyRsi, resolved.dailyRsiMin, resolved.dailyRsiMax),
  );
}

export function createStrategy(
  direction: StrategyDirection,
  thresholds?: Partial<ScanThresholds>,
  profile: ScanProfile = 'momentum',
): Strategy {
  return direction === 'short'
    ? createShortStrategy(thresholds, profile)
    : createLongStrategy(thresholds, profile);
}

const defaultLong = getDefaultThresholds('long', 'momentum');
const defaultShort = getDefaultThresholds('short', 'momentum');

/** @deprecated Prefer createLongStrategy / createStrategy with thresholds. */
export const volume24hRule: Rule = createVolumeRule(defaultLong.volume24hMin);
/** @deprecated Prefer createLongStrategy */
export const longDailyRsiRule: Rule = createBandRules(defaultLong)[1];
/** @deprecated Prefer createLongStrategy */
export const longH4RsiRule: Rule = createBandRules(defaultLong)[2];
/** @deprecated Prefer createLongStrategy */
export const longH1RsiRule: Rule = createBandRules(defaultLong)[3];
/** @deprecated Prefer createShortStrategy */
export const shortDailyRsiRule: Rule = createBandRules(defaultShort)[1];
/** @deprecated Prefer createShortStrategy */
export const shortH4RsiRule: Rule = createBandRules(defaultShort)[2];
/** @deprecated Prefer createShortStrategy */
export const shortH1RsiRule: Rule = createBandRules(defaultShort)[3];

/** @deprecated Prefer createLongStrategy */
export function createMomentumStrategy(): Strategy {
  return createLongStrategy();
}

/** @deprecated Prefer volume24hRule */
export const previousDailyVolumeRule = volume24hRule;
/** @deprecated Prefer longDailyRsiRule */
export const dailyRsiRule = longDailyRsiRule;
/** @deprecated Prefer longH4RsiRule */
export const h4RsiRule = longH4RsiRule;
/** @deprecated Prefer longH1RsiRule */
export const h1RsiRule = longH1RsiRule;
