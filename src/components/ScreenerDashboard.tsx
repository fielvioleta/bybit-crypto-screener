'use client';

import { useMemo, useState } from 'react';
import { BtcBiasStrip } from '@/components/BtcBias';
import { BybitReferralCta } from '@/components/BybitReferral';
import { DisclaimerBanner } from '@/components/Disclaimer';
import { FilterBar } from '@/components/FilterBar';
import { HoldDisciplineCallout } from '@/components/HoldDiscipline';
import { LoadingSpinner } from '@/components/Loading';
import { ScanParameters } from '@/components/ScanParameters';
import { ScanProfileToggle } from '@/components/ScanProfileToggle';
import { ScreenerTable } from '@/components/ScreenerTable';
import { SiteFooter } from '@/components/SiteFooter';
import { StatusBar } from '@/components/StatusBar';
import { StrategyToggle } from '@/components/StrategyToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useBtcBias } from '@/hooks/useBtcBias';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useRefreshInterval } from '@/hooks/useRefreshInterval';
import { useScanProfile } from '@/hooks/useScanProfile';
import { useScanThresholds } from '@/hooks/useScanThresholds';
import { useScreener } from '@/hooks/useScreener';
import type { ScanProfile, StrategyDirection } from '@/lib/screener/constants';

const HEADER_COPY: Record<
  ScanProfile,
  Record<StrategyDirection, { eyebrow: string; title: string; description: string }>
> = {
  early: {
    long: {
      eyebrow: 'Early / C-hunt assist',
      title: 'Pre-pump Candidate Screener',
      description:
        'Soft mid-RSI + waking volume shortlist. Confirm C + trend line on TradingView before entry — not auto-entry.',
    },
    short: {
      eyebrow: 'Early short assist',
      title: 'Early Short Candidate Screener',
      description:
        'Mid-band RSI shortlist for structure shorts. Confirm on TradingView — not a substitute for your chart read.',
    },
  },
  momentum: {
    long: {
      eyebrow: 'Continuation / confirmation',
      title: 'Long Momentum Screener',
      description:
        'High-RSI continuation filter after a move is underway. Use as confirmation — not your primary early C entry.',
    },
    short: {
      eyebrow: 'Continuation / confirmation',
      title: 'Short Momentum Screener',
      description:
        'Oversold continuation filter. Use as confirmation — not a replacement for structure.',
    },
  },
};

export function ScreenerDashboard() {
  const [direction, setDirection] = useState<StrategyDirection>('long');
  const { profile, setProfile } = useScanProfile();
  const { minutes: refreshMinutes, intervalMs, setMinutes: setRefreshMinutes } =
    useRefreshInterval();
  const { thresholds, setThresholds } = useScanThresholds(direction, profile);
  const { result, progress, error, isScanning, secondsUntilRefresh, refresh } = useScreener(
    direction,
    intervalMs,
    thresholds,
    profile,
  );
  const {
    bias: btcBias,
    error: btcBiasError,
    isLoading: btcBiasLoading,
  } = useBtcBias(intervalMs);
  const currentTime = useCurrentTime();
  const [search, setSearch] = useState('');

  const copy = HEADER_COPY[profile][direction];
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
      <BybitReferralCta variant="inline" />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p
            className={`text-xs tracking-[0.2em] uppercase ${
              profile === 'early'
                ? 'text-sky-600 dark:text-sky-400/80'
                : direction === 'long'
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

        <div className="flex flex-col items-stretch gap-2 self-start sm:items-end sm:self-auto">
          <div className="flex items-center gap-2">
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
          <ScanProfileToggle
            profile={profile}
            onChange={(next) => {
              setSearch('');
              setProfile(next);
            }}
            disabled={isScanning}
          />
        </div>
      </header>

      <BtcBiasStrip bias={btcBias} error={btcBiasError} isLoading={btcBiasLoading} />

      <HoldDisciplineCallout />

      <DisclaimerBanner />

      <ScanParameters
        direction={direction}
        profile={profile}
        refreshMinutes={refreshMinutes}
        thresholds={thresholds}
        onThresholdsChange={setThresholds}
        disabled={isScanning}
      />

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
          message={
            profile === 'early'
              ? `Scanning early ${direction} candidates...`
              : `Scanning ${direction} continuation setups...`
          }
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

      <SiteFooter />
    </div>
  );
}
