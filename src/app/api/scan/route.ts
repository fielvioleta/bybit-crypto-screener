import { screenerService } from '@/services/screener.service';
import {
  isScanProfile,
  isStrategyDirection,
  type ScanProfile,
  type StrategyDirection,
} from '@/lib/screener/constants';
import { parseThresholdsFromSearchParams } from '@/lib/screener/scan-thresholds';
import type { ScanStreamEvent } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
/** Bybit blocks US/CN IPs with HTTP 403 — keep functions outside those regions. */
export const preferredRegion = 'sin1';

function encodeEvent(event: ScanStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function resolveDirection(searchParams: URLSearchParams): StrategyDirection {
  const raw = searchParams.get('direction') ?? 'long';
  return isStrategyDirection(raw) ? raw : 'long';
}

function resolveProfile(searchParams: URLSearchParams): ScanProfile {
  const raw = searchParams.get('profile') ?? 'momentum';
  return isScanProfile(raw) ? raw : 'momentum';
}

export async function GET(request: Request): Promise<Response> {
  const searchParams = new URL(request.url).searchParams;
  const direction = resolveDirection(searchParams);
  const profile = resolveProfile(searchParams);
  const thresholds = parseThresholdsFromSearchParams(direction, profile, searchParams);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ScanStreamEvent) => {
        controller.enqueue(encoder.encode(encodeEvent(event)));
      };

      try {
        const result = await screenerService.scan(
          direction,
          (progress) => {
            send({ type: 'progress', progress });
          },
          thresholds,
          profile,
        );

        send({ type: 'result', result });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown scan error';
        send({ type: 'error', error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
