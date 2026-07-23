import {
  LONG_DAILY_RSI_MIN,
  LONG_H1_RSI_MIN,
  LONG_H4_RSI_MIN,
  SHORT_DAILY_RSI_MAX,
  SHORT_H1_RSI_MAX,
  SHORT_H4_RSI_MAX,
  VOLUME_24H_MIN_USDT,
  type StrategyDirection,
} from '@/lib/screener/constants';
import type { Rule } from './rule';
import { Strategy } from './strategy';

export const volume24hRule: Rule = {
  id: 'volume-24h',
  name: `24H Volume >= ${VOLUME_24H_MIN_USDT.toLocaleString()} USDT`,
  evaluate(data) {
    return data.volume24h >= VOLUME_24H_MIN_USDT;
  },
};

export const longDailyRsiRule: Rule = {
  id: 'long-daily-rsi',
  name: `Daily RSI(14) >= ${LONG_DAILY_RSI_MIN}`,
  evaluate(data) {
    return data.dailyRsi >= LONG_DAILY_RSI_MIN;
  },
};

export const longH4RsiRule: Rule = {
  id: 'long-h4-rsi',
  name: `4H RSI(14) >= ${LONG_H4_RSI_MIN}`,
  evaluate(data) {
    return data.h4Rsi >= LONG_H4_RSI_MIN;
  },
};

export const longH1RsiRule: Rule = {
  id: 'long-h1-rsi',
  name: `1H RSI(14) >= ${LONG_H1_RSI_MIN}`,
  evaluate(data) {
    return data.h1Rsi >= LONG_H1_RSI_MIN;
  },
};

export const shortDailyRsiRule: Rule = {
  id: 'short-daily-rsi',
  name: `Daily RSI(14) <= ${SHORT_DAILY_RSI_MAX}`,
  evaluate(data) {
    return data.dailyRsi <= SHORT_DAILY_RSI_MAX;
  },
};

export const shortH4RsiRule: Rule = {
  id: 'short-h4-rsi',
  name: `4H RSI(14) <= ${SHORT_H4_RSI_MAX}`,
  evaluate(data) {
    return data.h4Rsi <= SHORT_H4_RSI_MAX;
  },
};

export const shortH1RsiRule: Rule = {
  id: 'short-h1-rsi',
  name: `1H RSI(14) <= ${SHORT_H1_RSI_MAX}`,
  evaluate(data) {
    return data.h1Rsi <= SHORT_H1_RSI_MAX;
  },
};

export function createLongStrategy(): Strategy {
  return new Strategy(
    'momentum-long',
    'Long Momentum Strategy',
    [volume24hRule, longDailyRsiRule, longH4RsiRule, longH1RsiRule],
    (volume24h, dailyRsi) => volume24h >= VOLUME_24H_MIN_USDT && dailyRsi >= LONG_DAILY_RSI_MIN,
  );
}

export function createShortStrategy(): Strategy {
  return new Strategy(
    'momentum-short',
    'Short Momentum Strategy',
    [volume24hRule, shortDailyRsiRule, shortH4RsiRule, shortH1RsiRule],
    (volume24h, dailyRsi) => volume24h >= VOLUME_24H_MIN_USDT && dailyRsi <= SHORT_DAILY_RSI_MAX,
  );
}

export function createStrategy(direction: StrategyDirection): Strategy {
  return direction === 'short' ? createShortStrategy() : createLongStrategy();
}

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
