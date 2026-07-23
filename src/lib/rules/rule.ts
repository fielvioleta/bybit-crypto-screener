import type { SymbolData } from '@/lib/types';

export interface Rule {
  id: string;
  name: string;
  evaluate(data: SymbolData): boolean;
}
