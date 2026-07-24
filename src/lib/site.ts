/**
 * Public site config. Override with NEXT_PUBLIC_BYBIT_REFERRAL_URL in .env / Vercel if needed.
 */
export const BYBIT_REFERRAL_URL =
  process.env.NEXT_PUBLIC_BYBIT_REFERRAL_URL?.trim() ||
  'https://www.bybit.com/invite?ref=XXGERZ&medium=referral&utm_campaign=evergreen&share_to=link';

export const DISCLAIMER_POINTS = [
  'Personal tool — not financial advice.',
  'No guarantee of profit.',
  'You trade at your own risk.',
  'Data from Bybit public API; may be delayed or wrong.',
] as const;
