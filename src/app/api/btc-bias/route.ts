import { fetchBtcBiasSnapshot } from '@/lib/btc-bias/fetch-snapshot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** Bybit blocks US/CN IPs with HTTP 403 — keep functions outside those regions. */
export const preferredRegion = 'sin1';

export async function GET(): Promise<Response> {
  try {
    const snapshot = await fetchBtcBiasSnapshot();
    return Response.json(snapshot, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load BTC bias';
    return Response.json({ error: message }, { status: 502 });
  }
}
