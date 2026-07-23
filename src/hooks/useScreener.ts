'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import type { StrategyDirection } from '@/lib/screener/constants';
import type { ScanProgress, ScanResult, ScanStreamEvent } from '@/lib/types';

const INITIAL_PROGRESS: ScanProgress = {
  status: 'idle',
  scanned: 0,
  total: 0,
  message: 'Waiting to scan...',
};

async function runScanStream(
  direction: StrategyDirection,
  signal: AbortSignal,
  onProgress: (progress: ScanProgress) => void,
): Promise<ScanResult> {
  const response = await fetch(`/api/scan?direction=${direction}`, {
    method: 'GET',
    cache: 'no-store',
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Scan request failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result: ScanResult | null = null;
  let streamError: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() ?? '';

    for (const chunk of chunks) {
      const line = chunk
        .split('\n')
        .map((part) => part.trim())
        .find((part) => part.startsWith('data:'));

      if (!line) {
        continue;
      }

      const payload = line.slice(5).trim();
      if (!payload) {
        continue;
      }

      const event = JSON.parse(payload) as ScanStreamEvent;

      if (event.type === 'progress' && event.progress) {
        onProgress(event.progress);
      }

      if (event.type === 'result' && event.result) {
        result = event.result;
      }

      if (event.type === 'error') {
        streamError = event.error ?? 'Scan failed';
      }
    }
  }

  if (streamError) {
    throw new Error(streamError);
  }

  if (!result) {
    throw new Error('Scan completed without a result payload');
  }

  return result;
}

export function useScreener(direction: StrategyDirection, refreshIntervalMs: number) {
  const [progress, setProgress] = useState<ScanProgress>(INITIAL_PROGRESS);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const query = useQuery({
    queryKey: ['screener', 'scan', direction],
    queryFn: async ({ signal }) => {
      setProgress({
        status: 'scanning',
        scanned: 0,
        total: 0,
        message: 'Starting scan...',
      });

      const result = await runScanStream(direction, signal, setProgress);

      setProgress({
        status: 'completed',
        scanned: result.totalSymbols,
        total: result.totalSymbols,
        message: `Scan complete — ${result.matches.length} matches`,
      });

      return result;
    },
    refetchInterval: refreshIntervalMs,
    refetchIntervalInBackground: true,
  });

  const isScanning = query.isFetching;
  const refreshSeconds = Math.floor(refreshIntervalMs / 1000);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const elapsedSeconds = query.dataUpdatedAt
    ? Math.floor((nowMs - query.dataUpdatedAt) / 1000)
    : 0;
  const secondsUntilRefresh = isScanning
    ? 0
    : Math.max(0, refreshSeconds - elapsedSeconds);

  const refresh = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    result: query.data ?? null,
    progress,
    error: query.error instanceof Error ? query.error.message : null,
    isScanning,
    secondsUntilRefresh,
    refresh,
  };
}
