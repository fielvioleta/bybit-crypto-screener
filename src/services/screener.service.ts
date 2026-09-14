import { createStrategy } from '@/lib/rules';
import { runScreenerScan, type ProgressCallback } from '@/lib/screener';
import type { ScanProfile, StrategyDirection } from '@/lib/screener/constants';
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
    profile: ScanProfile = 'momentum',
  ): Promise<ScanResult> {
    const resolved = normalizeThresholds(
      direction,
      profile,
      thresholds ?? getDefaultThresholds(direction, profile),
    );
    const strategy = createStrategy(direction, resolved, profile);
    return runScreenerScan(strategy, onProgress, resolved);
  },
};
