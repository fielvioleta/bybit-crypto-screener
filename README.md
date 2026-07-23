# Crypto Momentum Screener

Personal Bybit USDT perpetual screener. No auth, no database, no trading.

## Strategies

Toggle between **Long** and **Short** in the UI.

### Long

- 24H Volume >= 10,000,000 USDT
- Daily RSI(14) >= 65
- 4H RSI(14) >= 65
- 1H RSI(14) >= 70

### Short

- 24H Volume >= 10,000,000 USDT
- Daily RSI(14) <= 35
- 4H RSI(14) <= 35
- 1H RSI(14) <= 30

RSI uses Wilder's smoothing. Auto-refresh is selectable: **1 / 5 / 15 minutes** (default 5).

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- TanStack Table + TanStack Query
- Bybit V5 public REST API

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint
- `npm run format` — Prettier
