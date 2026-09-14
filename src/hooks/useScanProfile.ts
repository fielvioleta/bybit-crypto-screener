'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  SCAN_PROFILE_STORAGE_KEY,
  isScanProfile,
  type ScanProfile,
} from '@/lib/screener/constants';

const CHANGE_EVENT = 'crypto-screener-scan-profile';

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }
  const handler = () => onStoreChange();
  window.addEventListener('storage', handler);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(CHANGE_EVENT, handler);
  };
}

function getSnapshot(): string {
  return window.localStorage.getItem(SCAN_PROFILE_STORAGE_KEY) ?? 'momentum';
}

function getServerSnapshot(): string {
  return 'momentum';
}

export function useScanProfile() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const profile: ScanProfile = isScanProfile(raw) ? raw : 'momentum';

  const setProfile = useCallback((next: ScanProfile) => {
    window.localStorage.setItem(SCAN_PROFILE_STORAGE_KEY, next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { profile, setProfile };
}
