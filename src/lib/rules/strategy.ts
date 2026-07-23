import type { SymbolData } from '@/lib/types';
import type { Rule } from './rule';

export type DailyPrefilter = (volume24h: number, dailyRsi: number) => boolean;

/**
 * Composes multiple rules. A symbol passes only when every rule returns true.
 */
export class Strategy {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly rules: readonly Rule[],
    public readonly dailyPrefilter: DailyPrefilter,
  ) {}

  evaluate(data: SymbolData): boolean {
    return this.rules.every((rule) => rule.evaluate(data));
  }
}
