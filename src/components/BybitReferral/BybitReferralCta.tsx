'use client';

import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { BYBIT_REFERRAL_URL } from '@/lib/site';

type BybitReferralCtaVariant = 'inline' | 'empty' | 'footer';

interface BybitReferralCtaProps {
  variant?: BybitReferralCtaVariant;
}

const VARIANT_CLASS: Record<BybitReferralCtaVariant, string> = {
  inline:
    'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3',
  empty: 'mt-4 flex flex-col items-center gap-2',
  footer: 'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between',
};

export function BybitReferralCta({ variant = 'inline' }: BybitReferralCtaProps) {
  return (
    <div className={VARIANT_CLASS[variant]}>
      <div className={variant === 'empty' ? 'text-center' : undefined}>
        <p className="text-sm text-foreground">
          {variant === 'empty' ? 'Ready to trade a setup?' : 'Trade these markets on Bybit'}
        </p>
        <p className="mt-0.5 text-[11px] text-subtle">I may earn a commission.</p>
      </div>

      <a
        href={BYBIT_REFERRAL_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-muted px-3 py-1.5 text-sm font-medium text-foreground transition hover:border-border-strong hover:bg-hover"
      >
        {variant === 'empty' ? 'Open Bybit account' : 'Trade on Bybit'}
        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
      </a>
    </div>
  );
}
