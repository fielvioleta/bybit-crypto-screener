import {
  LONG_DAILY_RSI_MIN,
  LONG_H1_RSI_MIN,
  LONG_H4_RSI_MIN,
  RSI_PERIOD,
  SHORT_DAILY_RSI_MAX,
  SHORT_H1_RSI_MAX,
  SHORT_H4_RSI_MAX,
  VOLUME_24H_MIN_USDT,
  formatRefreshIntervalLabel,
  type RefreshIntervalMinutes,
  type StrategyDirection,
} from '@/lib/screener/constants';
import { createStrategy } from '@/lib/rules';
import { formatVolume } from '@/lib/utils/format';

export interface ScanParameter {
  id: string;
  label: string;
  value: string;
}

export interface ScanInsight {
  direction: StrategyDirection;
  strategyName: string;
  market: string;
  indicator: string;
  refreshSeconds: number;
  sortBy: string;
  logic: string;
  parameters: ScanParameter[];
  rules: string[];
}

export function getScanInsight(
  direction: StrategyDirection,
  refreshMinutes: RefreshIntervalMinutes,
): ScanInsight {
  const strategy = createStrategy(direction);
  const isLong = direction === 'long';
  const refreshSeconds = refreshMinutes * 60;

  const parameters: ScanParameter[] = [
    {
      id: 'market',
      label: 'Market',
      value: 'Bybit USDT Perpetuals (all active)',
    },
    {
      id: 'indicator',
      label: 'Indicator',
      value: `Wilder RSI(${RSI_PERIOD})`,
    },
    {
      id: 'volume',
      label: '24H Volume',
      value: `≥ ${formatVolume(VOLUME_24H_MIN_USDT)} USDT`,
    },
    {
      id: 'daily-rsi',
      label: 'Daily RSI',
      value: isLong ? `>= ${LONG_DAILY_RSI_MIN}` : `<= ${SHORT_DAILY_RSI_MAX}`,
    },
    {
      id: 'h4-rsi',
      label: '4H RSI',
      value: isLong ? `>= ${LONG_H4_RSI_MIN}` : `<= ${SHORT_H4_RSI_MAX}`,
    },
    {
      id: 'h1-rsi',
      label: '1H RSI',
      value: isLong ? `>= ${LONG_H1_RSI_MIN}` : `<= ${SHORT_H1_RSI_MAX}`,
    },
    {
      id: 'refresh',
      label: 'Auto refresh',
      value: `Every ${formatRefreshIntervalLabel(refreshMinutes)}`,
    },
    {
      id: 'sort',
      label: 'Sort',
      value: 'Highest 24H volume first',
    },
  ];

  return {
    direction,
    strategyName: strategy.name,
    market: 'Bybit USDT Perpetuals',
    indicator: `Wilder RSI(${RSI_PERIOD})`,
    refreshSeconds,
    sortBy: 'Highest 24H volume first',
    logic: 'ALL conditions must pass',
    parameters,
    rules: strategy.rules.map((rule) => rule.name),
  };
}
