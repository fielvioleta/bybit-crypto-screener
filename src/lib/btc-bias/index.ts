export const BTC_SYMBOL = 'BTCUSDT';

/** RSI bands for bullish / neutral / bearish bias. */
export const BTC_BIAS_BEARISH_MAX = 45;
export const BTC_BIAS_BULLISH_MIN = 55;

export type BtcBiasLabel = 'bullish' | 'neutral' | 'bearish';

export type BtcLongCue = 'hunt' | 'mixed' | 'stand_down';

export interface BtcTimeframeBias {
  timeframe: '1H' | '4H' | 'Daily';
  rsi: number;
  bias: BtcBiasLabel;
}

export interface BtcBiasSnapshot {
  symbol: string;
  lastPrice: number;
  h1: BtcTimeframeBias;
  h4: BtcTimeframeBias;
  daily: BtcTimeframeBias;
  cue: BtcLongCue;
  cueLabel: string;
  updatedAt: number;
}

export function classifyRsiBias(rsi: number): BtcBiasLabel {
  if (!Number.isFinite(rsi)) {
    return 'neutral';
  }
  if (rsi < BTC_BIAS_BEARISH_MAX) {
    return 'bearish';
  }
  if (rsi > BTC_BIAS_BULLISH_MIN) {
    return 'bullish';
  }
  return 'neutral';
}

/**
 * Long C hunting cue from Daily + 4H (1H is shown in the UI but not required for the cue).
 * - Hunt: Daily bullish AND 4H not bearish
 * - Stand down: Daily bearish
 * - Mixed: otherwise
 */
export function resolveLongCue(daily: BtcBiasLabel, h4: BtcBiasLabel): BtcLongCue {
  if (daily === 'bearish') {
    return 'stand_down';
  }
  if (daily === 'bullish' && h4 !== 'bearish') {
    return 'hunt';
  }
  return 'mixed';
}

export function cueLabel(cue: BtcLongCue): string {
  switch (cue) {
    case 'hunt':
      return 'OK to hunt C longs — confirm on TV';
    case 'stand_down':
      return 'Do not force long Cs';
    case 'mixed':
    default:
      return 'Mixed — be selective on long Cs';
  }
}

export function cueDetail(cue: BtcLongCue): string {
  switch (cue) {
    case 'hunt':
      return 'Daily BTC supports long C setups. Still confirm structure on TradingView before entry.';
    case 'stand_down':
      return 'Daily BTC is bearish. Stand down on new long Cs — do not force setups into a dump.';
    case 'mixed':
    default:
      return 'BTC regime is mixed. Only take A+ C structures, smaller size, or wait for clearer bias.';
  }
}

export function buildTimeframeBias(
  timeframe: BtcTimeframeBias['timeframe'],
  rsi: number,
): BtcTimeframeBias {
  return {
    timeframe,
    rsi,
    bias: classifyRsiBias(rsi),
  };
}
