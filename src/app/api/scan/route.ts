import { screenerService } from '@/services/screener.service';
import { isStrategyDirection, type StrategyDirection } from '@/lib/screener/constants';
import type { ScanStreamEvent } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
/** Bybit blocks US/CN IPs with HTTP 403 — keep functions outside those regions. */
export const preferredRegion = 'sin1';

function encodeEvent(event: ScanStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function resolveDirection(request: Request): StrategyDirection {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('direction') ?? 'long';
  return isStrategyDirection(raw) ? raw : 'long';
}

export async function GET(request: Request): Promise<Response> {
  const direction = resolveDirection(request);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ScanStreamEvent) => {
        controller.enqueue(encoder.encode(encodeEvent(event)));
      };

      try {
        const result = await screenerService.scan(direction, (progress) => {
          send({ type: 'progress', progress });
        });

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
