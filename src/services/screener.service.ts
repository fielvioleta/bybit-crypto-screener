import { createStrategy } from '@/lib/rules';
import { runScreenerScan, type ProgressCallback } from '@/lib/screener';
import type { StrategyDirection } from '@/lib/screener/constants';
import type { ScanResult } from '@/lib/types';

/**
 * Screener application service.
 * Ready for future notification / history adapters without changing the scanner.
 */
export const screenerService = {
  async scan(
    direction: StrategyDirection = 'long',
    onProgress?: ProgressCallback,
  ): Promise<ScanResult> {
    const strategy = createStrategy(direction);
    return runScreenerScan(strategy, onProgress);
  },
};
