'use client';

import { useQuery } from '@tanstack/react-query';
import type { BtcBiasSnapshot } from '@/lib/btc-bias';

async function fetchBtcBias(signal: AbortSignal): Promise<BtcBiasSnapshot> {
  const response = await fetch('/api/btc-bias', {
    method: 'GET',
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `BTC bias request failed (${response.status})`);
  }

  return (await response.json()) as BtcBiasSnapshot;
}

export function useBtcBias(refreshIntervalMs: number) {
  const query = useQuery({
    queryKey: ['btc-bias'],
    queryFn: ({ signal }) => fetchBtcBias(signal),
    refetchInterval: refreshIntervalMs,
    refetchIntervalInBackground: true,
  });

  return {
    bias: query.data ?? null,
    error: query.error instanceof Error ? query.error.message : null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}
