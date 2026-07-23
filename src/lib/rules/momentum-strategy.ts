import type { StrategyDirection } from '@/lib/screener/constants';
import {
  getDefaultThresholds,
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

function createLongRules(thresholds: ScanThresholds): Rule[] {
  return [
    createVolumeRule(thresholds.volume24hMin),
    {
      id: 'long-daily-rsi',
      name: `Daily RSI(14) >= ${thresholds.dailyRsi}`,
      evaluate(data) {
        return data.dailyRsi >= thresholds.dailyRsi;
      },
    },
    {
      id: 'long-h4-rsi',
      name: `4H RSI(14) >= ${thresholds.h4Rsi}`,
      evaluate(data) {
        return data.h4Rsi >= thresholds.h4Rsi;
      },
    },
    {
      id: 'long-h1-rsi',
      name: `1H RSI(14) >= ${thresholds.h1Rsi}`,
      evaluate(data) {
        return data.h1Rsi >= thresholds.h1Rsi;
      },
    },
  ];
}

function createShortRules(thresholds: ScanThresholds): Rule[] {
  return [
    createVolumeRule(thresholds.volume24hMin),
    {
      id: 'short-daily-rsi',
      name: `Daily RSI(14) <= ${thresholds.dailyRsi}`,
      evaluate(data) {
        return data.dailyRsi <= thresholds.dailyRsi;
      },
    },
    {
      id: 'short-h4-rsi',
      name: `4H RSI(14) <= ${thresholds.h4Rsi}`,
      evaluate(data) {
        return data.h4Rsi <= thresholds.h4Rsi;
      },
    },
    {
      id: 'short-h1-rsi',
      name: `1H RSI(14) <= ${thresholds.h1Rsi}`,
      evaluate(data) {
        return data.h1Rsi <= thresholds.h1Rsi;
      },
    },
  ];
}

export function createLongStrategy(thresholds?: Partial<ScanThresholds>): Strategy {
  const resolved = normalizeThresholds('long', thresholds);
  return new Strategy(
    'momentum-long',
    'Long Momentum Strategy',
    createLongRules(resolved),
    (volume24h, dailyRsi) =>
      volume24h >= resolved.volume24hMin && dailyRsi >= resolved.dailyRsi,
  );
}

export function createShortStrategy(thresholds?: Partial<ScanThresholds>): Strategy {
  const resolved = normalizeThresholds('short', thresholds);
  return new Strategy(
    'momentum-short',
    'Short Momentum Strategy',
    createShortRules(resolved),
    (volume24h, dailyRsi) =>
      volume24h >= resolved.volume24hMin && dailyRsi <= resolved.dailyRsi,
  );
}

export function createStrategy(
  direction: StrategyDirection,
  thresholds?: Partial<ScanThresholds>,
): Strategy {
  return direction === 'short'
    ? createShortStrategy(thresholds)
    : createLongStrategy(thresholds);
}

const defaultLong = getDefaultThresholds('long');
const defaultShort = getDefaultThresholds('short');

/** @deprecated Prefer createLongStrategy / createStrategy with thresholds. */
export const volume24hRule: Rule = createVolumeRule(defaultLong.volume24hMin);
/** @deprecated Prefer createLongStrategy */
export const longDailyRsiRule: Rule = createLongRules(defaultLong)[1];
/** @deprecated Prefer createLongStrategy */
export const longH4RsiRule: Rule = createLongRules(defaultLong)[2];
/** @deprecated Prefer createLongStrategy */
export const longH1RsiRule: Rule = createLongRules(defaultLong)[3];
/** @deprecated Prefer createShortStrategy */
export const shortDailyRsiRule: Rule = createShortRules(defaultShort)[1];
/** @deprecated Prefer createShortStrategy */
export const shortH4RsiRule: Rule = createShortRules(defaultShort)[2];
/** @deprecated Prefer createShortStrategy */
export const shortH1RsiRule: Rule = createShortRules(defaultShort)[3];

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
