'use client';

import { DISCLAIMER_POINTS } from '@/lib/site';

export function DisclaimerBanner() {
  return (
    <aside
      className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-xs leading-relaxed text-muted"
      role="note"
      aria-label="Disclaimer"
    >
      <p className="font-semibold tracking-wide text-subtle uppercase">Disclaimer</p>
      <ul className="mt-2 list-disc space-y-1 pl-4">
        {DISCLAIMER_POINTS.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </aside>
  );
}
