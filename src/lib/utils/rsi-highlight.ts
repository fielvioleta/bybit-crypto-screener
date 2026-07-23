'use client';

import {
  STRONG_LONG_RSI_HIGHLIGHT,
  STRONG_SHORT_RSI_HIGHLIGHT,
  type StrategyDirection,
} from '@/lib/screener/constants';

export function isStrongRsi(value: number, direction: StrategyDirection): boolean {
  if (!Number.isFinite(value)) {
    return false;
  }

  return direction === 'short'
    ? value <= STRONG_SHORT_RSI_HIGHLIGHT
    : value >= STRONG_LONG_RSI_HIGHLIGHT;
}

export function strongRsiClassName(direction: StrategyDirection): string {
  return direction === 'short'
    ? 'font-semibold text-rose-600 dark:text-rose-400'
    : 'font-semibold text-emerald-600 dark:text-emerald-400';
}
