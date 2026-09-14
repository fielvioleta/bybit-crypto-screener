import {
  RSI_PERIOD,
  formatRefreshIntervalLabel,
  type RefreshIntervalMinutes,
  type ScanProfile,
  type StrategyDirection,
} from '@/lib/screener/constants';
import { createStrategy } from '@/lib/rules';
import { formatVolume } from '@/lib/utils/format';
import {
  getDefaultThresholds,
  normalizeThresholds,
  type ScanThresholds,
} from './scan-thresholds';

export interface ScanParameter {
  id: string;
  label: string;
  value: string;
  editable?: boolean;
}

export interface ScanInsight {
  direction: StrategyDirection;
  profile: ScanProfile;
  strategyName: string;
  market: string;
  indicator: string;
  refreshSeconds: number;
  sortBy: string;
  logic: string;
  role: string;
  parameters: ScanParameter[];
  rules: string[];
  thresholds: ScanThresholds;
}

function formatRsiParam(min: number, max: number): string {
  if (min <= 0 && max < 100) {
    return `<= ${max}`;
  }
  if (max >= 100) {
    return `>= ${min}`;
  }
  return `${min}–${max}`;
}

export function getScanInsight(
  direction: StrategyDirection,
  refreshMinutes: RefreshIntervalMinutes,
  thresholds?: Partial<ScanThresholds>,
  profile: ScanProfile = 'momentum',
): ScanInsight {
  const resolved = normalizeThresholds(
    direction,
    profile,
    thresholds ?? getDefaultThresholds(direction, profile),
  );
  const strategy = createStrategy(direction, resolved, profile);
  const refreshSeconds = refreshMinutes * 60;
  const isEarly = profile === 'early';

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
      id: 'profile',
      label: 'Scan role',
      value: isEarly
        ? 'Early / C-hunt assist (check on TradingView)'
        : 'Continuation / confirmation (not primary C entry)',
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
      value: formatRsiParam(resolved.dailyRsiMin, resolved.dailyRsiMax),
      editable: true,
    },
    {
      id: 'h4-rsi',
      label: '4H RSI',
      value: formatRsiParam(resolved.h4RsiMin, resolved.h4RsiMax),
      editable: true,
    },
    {
      id: 'h1-rsi',
      label: '1H RSI',
      value: formatRsiParam(resolved.h1RsiMin, resolved.h1RsiMax),
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
    profile,
    strategyName: strategy.name,
    market: 'Bybit USDT Perpetuals',
    indicator: `Wilder RSI(${RSI_PERIOD})`,
    refreshSeconds,
    sortBy: 'Highest 24H volume first',
    logic: 'ALL conditions must pass',
    role: isEarly
      ? 'Use as a shortlist for TradingView C + trend-line confirmation — not auto-entry.'
      : 'Continuation filter after structure is already working — not your primary early C entry.',
    parameters,
    rules: strategy.rules.map((rule) => rule.name),
    thresholds: resolved,
  };
}
