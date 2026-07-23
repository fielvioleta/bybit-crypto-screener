'use client';

import {
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import { getScanInsight } from '@/lib/screener/scan-insight';
import type { StrategyDirection, RefreshIntervalMinutes } from '@/lib/screener/constants';
import {
  getDefaultThresholds,
  normalizeThresholds,
  thresholdsEqual,
  type ScanThresholds,
} from '@/lib/screener/scan-thresholds';

interface ScanParametersProps {
  direction: StrategyDirection;
  refreshMinutes: RefreshIntervalMinutes;
  thresholds: ScanThresholds;
  onThresholdsChange: (thresholds: ScanThresholds) => void;
  disabled?: boolean;
}

type DraftFields = {
  volumeMillions: string;
  dailyRsi: string;
  h4Rsi: string;
  h1Rsi: string;
};

function toDraft(thresholds: ScanThresholds): DraftFields {
  return {
    volumeMillions: String(thresholds.volume24hMin / 1_000_000),
    dailyRsi: String(thresholds.dailyRsi),
    h4Rsi: String(thresholds.h4Rsi),
    h1Rsi: String(thresholds.h1Rsi),
  };
}

function parseDraft(direction: StrategyDirection, draft: DraftFields): ScanThresholds | null {
  const volumeMillions = Number(draft.volumeMillions);
  const dailyRsi = Number(draft.dailyRsi);
  const h4Rsi = Number(draft.h4Rsi);
  const h1Rsi = Number(draft.h1Rsi);

  if (
    !Number.isFinite(volumeMillions) ||
    volumeMillions < 0 ||
    !Number.isFinite(dailyRsi) ||
    !Number.isFinite(h4Rsi) ||
    !Number.isFinite(h1Rsi)
  ) {
    return null;
  }

  return normalizeThresholds(direction, {
    volume24hMin: volumeMillions * 1_000_000,
    dailyRsi,
    h4Rsi,
    h1Rsi,
  });
}

function ParameterInput({
  id,
  label,
  prefix,
  suffix,
  value,
  onChange,
  onEnter,
  disabled,
  min,
  max,
  step,
}: {
  id: string;
  label: string;
  prefix?: string;
  suffix?: string;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted px-3 py-2.5">
      <label htmlFor={id} className="text-[11px] tracking-wide text-subtle uppercase">
        {label}
      </label>
      <div className="mt-1 flex items-center gap-1.5">
        {prefix ? <span className="text-sm font-medium text-muted">{prefix}</span> : null}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onEnter?.();
            }
          }}
          className="w-full min-w-0 rounded-md border border-border bg-surface px-2 py-1 text-sm font-medium text-foreground outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {suffix ? <span className="shrink-0 text-xs text-muted">{suffix}</span> : null}
      </div>
    </div>
  );
}

export function ScanParameters({
  direction,
  refreshMinutes,
  thresholds,
  onThresholdsChange,
  disabled = false,
}: ScanParametersProps) {
  const [expanded, setExpanded] = useState(true);
  const thresholdsKey = `${direction}:${thresholds.volume24hMin}:${thresholds.dailyRsi}:${thresholds.h4Rsi}:${thresholds.h1Rsi}`;
  const [draft, setDraft] = useState<DraftFields>(() => toDraft(thresholds));
  const [draftSourceKey, setDraftSourceKey] = useState(thresholdsKey);

  if (draftSourceKey !== thresholdsKey) {
    setDraftSourceKey(thresholdsKey);
    setDraft(toDraft(thresholds));
  }

  const insight = useMemo(
    () => getScanInsight(direction, refreshMinutes, thresholds),
    [direction, refreshMinutes, thresholds],
  );
  const isLong = direction === 'long';
  const rsiOperator = isLong ? '≥' : '≤';
  const parsedDraft = parseDraft(direction, draft);
  const isDirty = parsedDraft ? !thresholdsEqual(parsedDraft, thresholds) : true;
  const canApply = Boolean(parsedDraft) && isDirty && !disabled;
  const defaults = getDefaultThresholds(direction);
  const canReset = !thresholdsEqual(thresholds, defaults) || isDirty;

  const updateDraft = (key: keyof DraftFields, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const applyDraft = () => {
    if (!parsedDraft || disabled) {
      return;
    }
    onThresholdsChange(parsedDraft);
  };

  const resetDefaults = () => {
    if (disabled) {
      return;
    }
    const next = getDefaultThresholds(direction);
    setDraft(toDraft(next));
    onThresholdsChange(next);
  };

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
                ? `${insight.strategyName} · ${insight.logic}. Adjust RSI/volume for BTC bias, then Apply.`
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
            <div className="rounded-lg border border-border bg-surface-muted px-3 py-2.5">
              <p className="text-[11px] tracking-wide text-subtle uppercase">Market</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                Bybit USDT Perpetuals (all active)
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-muted px-3 py-2.5">
              <p className="text-[11px] tracking-wide text-subtle uppercase">Indicator</p>
              <p className="mt-1 text-sm font-medium text-foreground">{insight.indicator}</p>
            </div>
            <ParameterInput
              id="scan-volume"
              label="24H Volume"
              prefix="≥"
              suffix="M USDT"
              value={draft.volumeMillions}
              onChange={(value) => updateDraft('volumeMillions', value)}
              onEnter={applyDraft}
              disabled={disabled}
              min={0}
              step={0.5}
            />
            <ParameterInput
              id="scan-daily-rsi"
              label="Daily RSI"
              prefix={rsiOperator}
              value={draft.dailyRsi}
              onChange={(value) => updateDraft('dailyRsi', value)}
              onEnter={applyDraft}
              disabled={disabled}
              min={0}
              max={100}
              step={1}
            />
            <ParameterInput
              id="scan-h4-rsi"
              label="4H RSI"
              prefix={rsiOperator}
              value={draft.h4Rsi}
              onChange={(value) => updateDraft('h4Rsi', value)}
              onEnter={applyDraft}
              disabled={disabled}
              min={0}
              max={100}
              step={1}
            />
            <ParameterInput
              id="scan-h1-rsi"
              label="1H RSI"
              prefix={rsiOperator}
              value={draft.h1Rsi}
              onChange={(value) => updateDraft('h1Rsi', value)}
              onEnter={applyDraft}
              disabled={disabled}
              min={0}
              max={100}
              step={1}
            />
            <div className="rounded-lg border border-border bg-surface-muted px-3 py-2.5">
              <p className="text-[11px] tracking-wide text-subtle uppercase">Auto refresh</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {insight.parameters.find((parameter) => parameter.id === 'refresh')?.value}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-muted px-3 py-2.5">
              <p className="text-[11px] tracking-wide text-subtle uppercase">Sort</p>
              <p className="mt-1 text-sm font-medium text-foreground">{insight.sortBy}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={applyDraft}
              disabled={!canApply}
              className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isLong
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-rose-600 text-white hover:bg-rose-500'
              }`}
            >
              Apply & rescan
            </button>
            <button
              type="button"
              onClick={resetDefaults}
              disabled={disabled || !canReset}
              className="inline-flex items-center rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset defaults
            </button>
            {isDirty ? (
              <p className="text-xs text-muted">Unsaved changes — apply to run a new scan.</p>
            ) : null}
            {!parsedDraft ? (
              <p className="text-xs text-danger-text">Enter valid numbers for all fields.</p>
            ) : null}
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
