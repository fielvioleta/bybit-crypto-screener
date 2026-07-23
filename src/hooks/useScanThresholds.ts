'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { StrategyDirection } from '@/lib/screener/constants';
import {
  SCAN_THRESHOLDS_STORAGE_KEY,
  getDefaultThresholds,
  normalizeThresholds,
  type ScanThresholds,
  type StoredScanThresholds,
} from '@/lib/screener/scan-thresholds';

const THRESHOLDS_CHANGE_EVENT = 'crypto-screener-thresholds';

function parseStored(raw: string | null): StoredScanThresholds {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as StoredScanThresholds;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handler = () => onStoreChange();
  window.addEventListener('storage', handler);
  window.addEventListener(THRESHOLDS_CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(THRESHOLDS_CHANGE_EVENT, handler);
  };
}

function getSnapshot(): string {
  return window.localStorage.getItem(SCAN_THRESHOLDS_STORAGE_KEY) ?? '';
}

function getServerSnapshot(): string {
  return '';
}

export function useScanThresholds(direction: StrategyDirection) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const stored = useMemo(() => parseStored(raw || null), [raw]);

  const thresholds = useMemo(
    () => normalizeThresholds(direction, stored[direction] ?? getDefaultThresholds(direction)),
    [direction, stored],
  );

  const setThresholds = useCallback(
    (next: ScanThresholds) => {
      const normalized = normalizeThresholds(direction, next);
      const current = parseStored(window.localStorage.getItem(SCAN_THRESHOLDS_STORAGE_KEY));
      const updated: StoredScanThresholds = { ...current, [direction]: normalized };
      window.localStorage.setItem(SCAN_THRESHOLDS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(THRESHOLDS_CHANGE_EVENT));
    },
    [direction],
  );

  const resetThresholds = useCallback(() => {
    setThresholds(getDefaultThresholds(direction));
  }, [direction, setThresholds]);

  return {
    thresholds,
    setThresholds,
    resetThresholds,
    defaults: getDefaultThresholds(direction),
  };
}
