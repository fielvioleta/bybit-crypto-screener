'use client';

import { formatPrice, formatRsi, formatTimestamp, formatVolume, isStrongRsi } from '@/lib/utils';
import type { StrategyDirection } from '@/lib/screener/constants';
import type { ScreenerMatch } from '@/lib/types';

interface ScreenerRowDetailsProps {
  row: ScreenerMatch;
  direction: StrategyDirection;
}

function DetailItem({
  label,
  value,
  strong = false,
  direction,
}: {
  label: string;
  value: string;
  strong?: boolean;
  direction: StrategyDirection;
}) {
  const strongClass =
    direction === 'short'
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-emerald-600 dark:text-emerald-400';

  return (
    <div>
      <p className="text-xs tracking-wide text-subtle uppercase">{label}</p>
      <p className={`mt-1 text-sm font-medium ${strong ? strongClass : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}

export function ScreenerRowDetails({ row, direction }: ScreenerRowDetailsProps) {
  return (
    <div className="grid gap-4 border-t border-border bg-surface-muted px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
      <DetailItem
        label="Daily RSI"
        value={formatRsi(row.dailyRsi)}
        strong={isStrongRsi(row.dailyRsi, direction)}
        direction={direction}
      />
      <DetailItem
        label="4H RSI"
        value={formatRsi(row.h4Rsi)}
        strong={isStrongRsi(row.h4Rsi, direction)}
        direction={direction}
      />
      <DetailItem
        label="1H RSI"
        value={formatRsi(row.h1Rsi)}
        strong={isStrongRsi(row.h1Rsi, direction)}
        direction={direction}
      />
      <DetailItem
        label="24H Volume"
        value={`${formatVolume(row.volume24h)} USDT`}
        direction={direction}
      />
      <DetailItem label="Current Price" value={formatPrice(row.currentPrice)} direction={direction} />
      <DetailItem
        label="Latest Candle"
        value={formatTimestamp(row.latestCandleTimestamp)}
        direction={direction}
      />
    </div>
  );
}
