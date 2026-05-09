# Quant Alpha - Institutional FX Analytics

Quant Alpha is a professional-grade, full-stack React web application engineered to supply quantitative traders and hedge funds with real-time analytics on major FX pairs. By algorithmically evaluating current market tick data, it calculates the underlying relative strength of fundamental currencies (USD, EUR, GBP, JPY, AUD, CAD, CHF, NZD).

## Features

- **Real-Time Market Tick Monitoring**: Pulls up-to-date Forex exchange quotes.
- **Advanced Relative Strength Engine**: Exposes the true directional biases by mapping pairs directly to baseline currency strength index.
- **Dynamic Heatmatrix**: Renders AAA-standard, glowing, SVG-filtered graphical projections of multi-timeframe analytics (15M, 1H, 1D, 1W). You can click on the currencies to filter out noise.
- **Macro Economic Calendar**: Integrated, responsive feed of globally significant monetary policy shifts and releases.
- **Professional Command Center**: Distinctive glass-morphism, hardware-accelerated user interface designed for extended viewing on institutional trade floors.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, Recharts, Lucide React.
- **Data Engine**: Custom relative-strength algorithms powered through multi-timeframe quote aggregation.
- **Backend Infrastructure**: Built-in Express backend to proxy and bypass CORS, keeping API keys private and architecture clean.
- **Deployments**: Docker ready. See `DEPLOYMENT.md` for zero-downtime Dokploy configurations.

## Architecture Details
See `CALCULATIONS.md` for a breakdown of how the mathematical relative strengths are formulated across time increments.

## Quick Start
```bash
npm install
npm run dev
```
