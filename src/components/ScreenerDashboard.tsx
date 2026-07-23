'use client';

import { useMemo, useState } from 'react';
import { FilterBar } from '@/components/FilterBar';
import { LoadingSpinner } from '@/components/Loading';
import { ScanParameters } from '@/components/ScanParameters';
import { ScreenerTable } from '@/components/ScreenerTable';
import { StatusBar } from '@/components/StatusBar';
import { StrategyToggle } from '@/components/StrategyToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useRefreshInterval } from '@/hooks/useRefreshInterval';
import { useScreener } from '@/hooks/useScreener';
import type { StrategyDirection } from '@/lib/screener/constants';

const STRATEGY_COPY: Record<
  StrategyDirection,
  { eyebrow: string; title: string; description: string }
> = {
  long: {
    eyebrow: 'Long tracker',
    title: 'Crypto Momentum Screener',
    description:
      'Live screen of Bybit USDT perpetuals for high-volume long momentum setups.',
  },
  short: {
    eyebrow: 'Short tracker',
    title: 'Crypto Short Screener',
    description:
      'Live screen of Bybit USDT perpetuals for high-volume short / oversold setups.',
  },
};

export function ScreenerDashboard() {
  const [direction, setDirection] = useState<StrategyDirection>('long');
  const { minutes: refreshMinutes, intervalMs, setMinutes: setRefreshMinutes } =
    useRefreshInterval();
  const { result, progress, error, isScanning, secondsUntilRefresh, refresh } = useScreener(
    direction,
    intervalMs,
  );
  const currentTime = useCurrentTime();
  const [search, setSearch] = useState('');

  const copy = STRATEGY_COPY[direction];
  const matches = useMemo(() => result?.matches ?? [], [result?.matches]);
  const filteredCount = useMemo(() => {
    const query = search.trim().toUpperCase();
    if (!query) {
      return matches.length;
    }
    return matches.filter((match) => match.symbol.includes(query)).length;
  }, [matches, search]);

  const showInitialLoading = isScanning && !result;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p
            className={`text-xs tracking-[0.2em] uppercase ${
              direction === 'long'
                ? 'text-emerald-600 dark:text-emerald-400/80'
                : 'text-rose-600 dark:text-rose-400/80'
            }`}
          >
            {copy.eyebrow} · Bybit USDT Perpetuals
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {copy.title}
          </h1>
          <p className="max-w-2xl text-sm text-muted">{copy.description}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ThemeToggle />
          <StrategyToggle
            direction={direction}
            onChange={(next) => {
              setSearch('');
              setDirection(next);
            }}
            disabled={isScanning}
          />
        </div>
      </header>

      <ScanParameters direction={direction} refreshMinutes={refreshMinutes} />

      <StatusBar
        secondsUntilRefresh={secondsUntilRefresh}
        currentTime={currentTime}
        progress={progress}
        totalSymbols={result?.totalSymbols ?? progress.total}
        matchingSymbols={result?.matches.length ?? 0}
        lastScanAt={result?.scannedAt ?? null}
        isScanning={isScanning}
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        onRefresh={refresh}
        isScanning={isScanning}
        matchCount={filteredCount}
        refreshMinutes={refreshMinutes}
        onRefreshMinutesChange={setRefreshMinutes}
      />

      {error ? (
        <div className="rounded-xl border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger-text">
          {error}
        </div>
      ) : null}

      {showInitialLoading ? (
        <LoadingSpinner
          message={`Scanning ${direction} setups...`}
          detail={
            progress.total > 0
              ? `${progress.scanned} / ${progress.total} symbols`
              : progress.message
          }
        />
      ) : (
        <ScreenerTable data={matches} search={search} direction={direction} />
      )}

      {isScanning && result ? (
        <p className="text-center text-xs text-subtle">
          Refresh in progress — {progress.message}
        </p>
      ) : null}
    </div>
  );
}
