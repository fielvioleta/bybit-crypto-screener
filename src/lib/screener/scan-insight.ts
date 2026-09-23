import {
  RSI_PERIOD,
  formatRefreshIntervalLabel,
  type RefreshIntervalMinutes,
  type StrategyDirection,
} from '@/lib/screener/constants';
import { createStrategy } from '@/lib/rules';
import { formatVolume } from '@/lib/utils/format';
import { getDefaultThresholds, normalizeThresholds, type ScanThresholds } from './scan-thresholds';

export interface ScanParameter {
  id: string;
  label: string;
  value: string;
  editable?: boolean;
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
  thresholds: ScanThresholds;
}

export function getScanInsight(
  direction: StrategyDirection,
  refreshMinutes: RefreshIntervalMinutes,
  thresholds?: Partial<ScanThresholds>,
): ScanInsight {
  const resolved = normalizeThresholds(direction, thresholds ?? getDefaultThresholds(direction));
  const strategy = createStrategy(direction, resolved);
  const isLong = direction === 'long';
  const refreshSeconds = refreshMinutes * 60;
  const rsiOperator = isLong ? '>=' : '<=';

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
      value: `≥ ${formatVolume(resolved.volume24hMin)} USDT`,
      editable: true,
    },
    {
      id: 'daily-rsi',
      label: 'Daily RSI',
      value: `${rsiOperator} ${resolved.dailyRsi}`,
      editable: true,
    },
    {
      id: 'h4-rsi',
      label: '4H RSI',
      value: `${rsiOperator} ${resolved.h4Rsi}`,
      editable: true,
    },
    {
      id: 'h1-rsi',
      label: '1H RSI',
      value: `${rsiOperator} ${resolved.h1Rsi}`,
      editable: true,
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
    thresholds: resolved,
  };
}
