'use client';

import {
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import { getScanInsight } from '@/lib/screener/scan-insight';
import type { StrategyDirection, RefreshIntervalMinutes } from '@/lib/screener/constants';

interface ScanParametersProps {
  direction: StrategyDirection;
  refreshMinutes: RefreshIntervalMinutes;
}

export function ScanParameters({ direction, refreshMinutes }: ScanParametersProps) {
  const [expanded, setExpanded] = useState(true);
  const insight = useMemo(
    () => getScanInsight(direction, refreshMinutes),
    [direction, refreshMinutes],
  );
  const isLong = direction === 'long';

  return (
    <section
      className={`rounded-xl border bg-surface px-4 py-3 sm:px-5 ${
        isLong
          ? 'border-emerald-200 dark:border-emerald-900/50'
          : 'border-rose-200 dark:border-rose-900/50'
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        aria-label={expanded ? 'Hide scan parameters' : 'Show scan parameters'}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="flex min-w-0 items-start gap-3">
          <InformationCircleIcon
            className={`mt-0.5 h-5 w-5 shrink-0 ${
              isLong ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Active scan parameters</h2>
              <span
                className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${
                  isLong
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                }`}
              >
                {direction} mode
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {expanded
                ? `${insight.strategyName} · ${insight.logic}. Only symbols that satisfy every rule are shown.`
                : `${insight.strategyName} · ${insight.rules.length} rules`}
            </p>
          </div>
        </div>

        <span
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted"
          aria-hidden="true"
        >
          {expanded ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </span>
      </button>

      {expanded ? (
        <div className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {insight.parameters.map((parameter) => (
              <div
                key={parameter.id}
                className="rounded-lg border border-border bg-surface-muted px-3 py-2.5"
              >
                <p className="text-[11px] tracking-wide text-subtle uppercase">{parameter.label}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{parameter.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-2 text-[11px] tracking-wide text-subtle uppercase">Rule checklist</p>
            <ul className="flex flex-wrap gap-2">
              {insight.rules.map((rule) => (
                <li
                  key={rule}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    isLong
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200/90'
                      : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200/90'
                  }`}
                >
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
