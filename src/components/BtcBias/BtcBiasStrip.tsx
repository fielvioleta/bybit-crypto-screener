'use client';

import type { BtcBiasLabel, BtcBiasSnapshot, BtcLongCue, BtcTimeframeBias } from '@/lib/btc-bias';
import { cueDetail } from '@/lib/btc-bias';
import { formatPrice, formatRsi } from '@/lib/utils';

interface BtcBiasStripProps {
  bias: BtcBiasSnapshot | null;
  error: string | null;
  isLoading: boolean;
}

function biasChipClass(label: BtcBiasLabel): string {
  switch (label) {
    case 'bullish':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
    case 'bearish':
      return 'bg-rose-500/15 text-rose-700 dark:text-rose-300';
    case 'neutral':
    default:
      return 'bg-zinc-500/10 text-muted';
  }
}

function sectionClass(cue: BtcLongCue): string {
  switch (cue) {
    case 'hunt':
      return 'border-emerald-300 dark:border-emerald-800/80';
    case 'stand_down':
      return 'border-rose-400 dark:border-rose-800';
    case 'mixed':
    default:
      return 'border-border';
  }
}

function cueClass(cue: BtcLongCue): string {
  switch (cue) {
    case 'hunt':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200';
    case 'stand_down':
      return 'border-rose-300 bg-rose-100 text-rose-900 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-100';
    case 'mixed':
    default:
      return 'border-border bg-surface-muted text-foreground';
  }
}

function TimeframeCell({ frame }: { frame: BtcTimeframeBias }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted px-3 py-2">
      <p className="text-[11px] tracking-wide text-subtle uppercase">{frame.timeframe}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-foreground">{formatRsi(frame.rsi)}</span>
        <span
          className={`inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${biasChipClass(frame.bias)}`}
        >
          {frame.bias}
        </span>
      </div>
    </div>
  );
}

export function BtcBiasStrip({ bias, error, isLoading }: BtcBiasStripProps) {
  if (error && !bias) {
    return (
      <section className="rounded-xl border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger-text">
        BTC bias unavailable — {error}
      </section>
    );
  }

  if (isLoading && !bias) {
    return (
      <section className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
        Loading BTC bias…
      </section>
    );
  }

  if (!bias) {
    return null;
  }

  return (
    <section
      className={`rounded-xl border bg-surface px-4 py-3 sm:px-5 ${sectionClass(bias.cue)}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">BTC bias</h2>
            <span className="text-sm font-medium text-muted">{bias.symbol}</span>
            <span className="text-sm font-semibold text-foreground">
              ${formatPrice(bias.lastPrice)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Wilder RSI(14) on 1H / 4H / Daily — regime check before hunting long Cs.
          </p>
        </div>

        <p
          className={`inline-flex max-w-sm w-fit rounded-full border px-3 py-1.5 text-xs font-semibold leading-snug ${cueClass(bias.cue)}`}
        >
          {bias.cueLabel}
        </p>
      </div>

      <p
        className={`mt-3 rounded-lg border px-3 py-2 text-xs leading-relaxed ${cueClass(bias.cue)}`}
      >
        {cueDetail(bias.cue)}
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <TimeframeCell frame={bias.h1} />
        <TimeframeCell frame={bias.h4} />
        <TimeframeCell frame={bias.daily} />
      </div>

      {error ? <p className="mt-2 text-xs text-danger-text">Refresh issue: {error}</p> : null}
    </section>
  );
}
