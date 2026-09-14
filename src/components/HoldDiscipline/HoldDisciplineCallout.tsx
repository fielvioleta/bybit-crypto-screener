'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'crypto-screener-hold-discipline-dismissed';
const CHANGE_EVENT = 'crypto-screener-hold-discipline';

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
  return window.localStorage.getItem(STORAGE_KEY) ?? '';
}

function getServerSnapshot(): string {
  return '';
}

export function HoldDisciplineCallout() {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) === '1';

  const dismiss = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, '1');
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  if (dismissed) {
    return null;
  }

  return (
    <aside className="relative rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss hold-time guidance"
        className="absolute top-2 right-2 rounded-md p-1 text-amber-800/70 transition hover:bg-amber-100 hover:text-amber-950 dark:text-amber-200/70 dark:hover:bg-amber-900/40 dark:hover:text-amber-50"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
      <p className="pr-8 text-[11px] font-semibold tracking-wide text-amber-800/80 uppercase dark:text-amber-200/80">
        Hold discipline (from your 90d P&amp;L)
      </p>
      <p className="mt-1 max-w-3xl text-sm leading-relaxed">
        Avoid sub-30m scratches — they drove most losses. Your winners clustered at{' '}
        <span className="font-semibold">2h+</span>. For C + trend-line longs: confirm on TradingView,
        then give the idea time (stops still OK; impatience exits are not).
      </p>
    </aside>
  );
}
