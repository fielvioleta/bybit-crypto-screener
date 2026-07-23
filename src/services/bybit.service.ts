import { bybitClient } from '@/lib/bybit';

/**
 * Application service wrapping the Bybit market data client.
 * Keeps API access behind a single boundary for future adapters.
 */
export const bybitService = {
  getSymbols: bybitClient.getSymbols,
  getKlines: bybitClient.getKlines,
  getTicker: bybitClient.getTicker,
};
