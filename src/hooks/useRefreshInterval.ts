'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_REFRESH_INTERVAL_MINUTES,
  REFRESH_INTERVAL_STORAGE_KEY,
  getRefreshIntervalMs,
  isRefreshIntervalMinutes,
  type RefreshIntervalMinutes,
} from '@/lib/screener/constants';

function readStoredInterval(): RefreshIntervalMinutes {
  if (typeof window === 'undefined') {
    return DEFAULT_REFRESH_INTERVAL_MINUTES;
  }

  const raw = window.localStorage.getItem(REFRESH_INTERVAL_STORAGE_KEY);
  const parsed = Number(raw);
  return isRefreshIntervalMinutes(parsed) ? parsed : DEFAULT_REFRESH_INTERVAL_MINUTES;
}

export function useRefreshInterval() {
  const [minutes, setMinutesState] = useState<RefreshIntervalMinutes>(
    DEFAULT_REFRESH_INTERVAL_MINUTES,
  );

  useEffect(() => {
    setMinutesState(readStoredInterval());
  }, []);

  const setMinutes = useCallback((next: RefreshIntervalMinutes) => {
    setMinutesState(next);
    window.localStorage.setItem(REFRESH_INTERVAL_STORAGE_KEY, String(next));
  }, []);

  return {
    minutes,
    intervalMs: getRefreshIntervalMs(minutes),
    setMinutes,
  };
}
