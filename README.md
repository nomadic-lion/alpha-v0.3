# Quant Alpha Matrix Platform

Quant Alpha is a professional, institutional-grade Forex Relative Strength Matrix. It aggregates live and historical market data from 7 major reference currency pairs to derive real-time values for a matrix of 28 pairs.

## System Architecture

1. **Frontend**: The user interface is built heavily with React, Recharts, and Tailwind CSS to mimic a highly professional, dark-mode terminal common in institutional trading desks (e.g. Bloomberg Terminal).
2. **Backend**: An Express.js server pulls data from the Yahoo Finance API (`yahoo-finance2`).
3. **Analytics Engine**: The server-side and client-side systems analyze percentage correlations against the US Dollar to deduce real, underlying currency flow momentum.

## Quick Start (Development)

To run this application locally during development:

```bash
# Install packages
npm install

# Run the development server
npm run dev
```

Visit `http://localhost:3000` to view the matrix.

## Documentation Overview

We have documented the two crucial operational aspects of the application:

1. **[CALCULATIONS.md](./CALCULATIONS.md)**: A detailed breakdown of the mathematical properties and system logic underpinning the 28-pair derivation algorithm and data timelines.
2. **[DEPLOYMENT.md](./DEPLOYMENT.md)**: A complete, rigorous guide for deploying this codebase securely via an isolated Docker environment to a Google Cloud VPS.

## Core Features
1. **World Financial Clocks**: Live time representations of the Tokyo, London, New York, and Sydney markets.
2. **Synthesized Matrix Calculations**: Extracting full values across 8 global reserve currencies (USD, EUR, GBP, JPY, CAD, AUD, NZD, CHF).
3. **High-Fidelity Interpolation**: Real-time correlation tracking and strength indexing over custom timeframes (1D, 1W, 1M).
4. **Economic Calendar Integration**: Tracking systemic geopolitical news across targeted nations to map out upcoming volatile moves (Requires external API for full data in production).

## Production Readiness
This web application is highly performant and includes production Dockerization setup files.

Please see the Deployment Guide for further instructions on scaling this out to Google Cloud.
