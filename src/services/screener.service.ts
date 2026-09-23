import { createStrategy } from '@/lib/rules';
import { runScreenerScan, type ProgressCallback } from '@/lib/screener';
import type { StrategyDirection } from '@/lib/screener/constants';
import {
  getDefaultThresholds,
  normalizeThresholds,
  type ScanThresholds,
} from '@/lib/screener/scan-thresholds';
import type { ScanResult } from '@/lib/types';

/**
 * Screener application service.
 * Ready for future notification / history adapters without changing the scanner.
 */
export const screenerService = {
  async scan(
    direction: StrategyDirection = 'long',
    onProgress?: ProgressCallback,
    thresholds?: Partial<ScanThresholds>,
  ): Promise<ScanResult> {
    const resolved = normalizeThresholds(direction, thresholds ?? getDefaultThresholds(direction));
    const strategy = createStrategy(direction, resolved);
    return runScreenerScan(strategy, onProgress, resolved);
  },
};
