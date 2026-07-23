import { BYBIT_BASE_URL } from '@/lib/screener/constants';

export const BYBIT_ENDPOINTS = {
  instrumentsInfo: `${BYBIT_BASE_URL}/v5/market/instruments-info`,
  kline: `${BYBIT_BASE_URL}/v5/market/kline`,
  tickers: `${BYBIT_BASE_URL}/v5/market/tickers`,
} as const;
