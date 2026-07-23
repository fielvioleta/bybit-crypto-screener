export interface Candle {
  startTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover: number;
}

export type Timeframe = 'D' | '240' | '60';

export interface SymbolData {
  symbol: string;
  currentPrice: number;
  volume24h: number;
  dailyRsi: number;
  h4Rsi: number;
  h1Rsi: number;
  dailyCandles: Candle[];
  h4Candles: Candle[];
  h1Candles: Candle[];
  latestCandleTimestamp: number;
  scannedAt: number;
}

export type ScreenerMatch = SymbolData;

export interface ScanProgress {
  status: 'idle' | 'scanning' | 'completed' | 'error';
  scanned: number;
  total: number;
  message: string;
}

export interface ScanResult {
  matches: ScreenerMatch[];
  totalSymbols: number;
  scannedSymbols: number;
  failedSymbols: number;
  scannedAt: number;
  durationMs: number;
}

export interface ScanStreamEvent {
  type: 'progress' | 'result' | 'error';
  progress?: ScanProgress;
  result?: ScanResult;
  error?: string;
}
