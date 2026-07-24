'use client';

import { DISCLAIMER_POINTS } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="mt-4 border-t border-border pt-6 pb-2">
      <p className="text-[11px] leading-relaxed text-subtle">{DISCLAIMER_POINTS.join(' ')}</p>
    </footer>
  );
}
