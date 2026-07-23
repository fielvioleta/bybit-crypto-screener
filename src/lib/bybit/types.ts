export interface BybitApiResponse<T> {
  retCode: number;
  retMsg: string;
  result: T;
  time: number;
}

export interface BybitInstrument {
  symbol: string;
  contractType: string;
  status: string;
  settleCoin: string;
}

export interface BybitInstrumentsResult {
  category: string;
  list: BybitInstrument[];
  nextPageCursor?: string;
}

export interface BybitTicker {
  symbol: string;
  lastPrice: string;
  turnover24h: string;
}

export interface BybitTickersResult {
  category: string;
  list: BybitTicker[];
}

/** Bybit kline row: [start, open, high, low, close, volume, turnover] */
export type BybitKlineRow = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export interface BybitKlinesResult {
  category: string;
  symbol: string;
  list: BybitKlineRow[];
}
