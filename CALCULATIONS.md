# Currency Strength Calculations

This document explains the mathematical model and data pipeline used in Quant Alpha to calculate real-time relative currency strengths.

## Overview

Traditional currency pairs only tell you the relative value of two currencies (e.g., EUR vs. USD). If EUR/USD goes up, you don't instantly know if the Euro got stronger or the US Dollar got weaker.

**Relative Currency Strength** solves this by decomposing pair prices into individual, isolated currency strengths. We analyze 8 primary currencies: `USD`, `EUR`, `GBP`, `JPY`, `AUD`, `NZD`, `CAD`, and `CHF`.

## 1. The Reference Currency (USD)

We simplify the matrix by anchoring all calculations to the US Dollar (USD), making it the base for value reference.
- $V_{USD} = 1.0$ (The baseline)
- The value of any other currency $c$ is simply its price in USD: $V_c = Price(c/USD)$

### Deriving Values from Majors
We fetch real-time and historical price data for 7 major pairs from Yahoo Finance API:
- **EUR/USD**, **GBP/USD**, **AUD/USD**, **NZD/USD** (Quote is USD, so $V_c = currentPrice$)
- **USD/JPY**, **USD/CHF**, **USD/CAD** (Base is USD, so $V_c = 1 / currentPrice$)

## 2. Deriving the Full Matrix (28 Pairs)

With the USD value of all 8 primary currencies known, we can synthetically construct the price of any cross-pair without needing to query it directly from the data feed, reducing latency and API usage.

For any pair Base/Quote (e.g., EUR/GBP):
$$Price(Base/Quote) = \frac{V_{Base}}{V_{Quote}}$$

*Example:* If EUR/USD is 1.10 ($V_{EUR} = 1.10$) and GBP/USD is 1.25 ($V_{GBP} = 1.25$), then EUR/GBP = $1.10 / 1.25 = 0.8800$.

## 3. Strength Calculation (% Change)

Strength is measured as the percentage change in a currency's value over a selected timeframe (e.g., 15M, 1H, 1D, 1W).

### Step A: Opening Values
We query the historical data to find the exact opening price of the 7 major pairs at the start of the timeframe window. We then derive the opening USD values for all 8 currencies, denoted as $V_{c, open}$.

### Step B: Current Values
We use the latest available tick to determine the current USD values for all 8 currencies, denoted as $V_{c, current}$.

### Step C: Relative Change
For each pair of currencies $(c_i, c_j)$:
The percentage change of the pair $c_i/c_j$ over the timeframe is:
$$\Delta(c_i, c_j) = \frac{(V_{c_i, current} / V_{c_j, current}) - (V_{c_i, open} / V_{c_j, open})}{V_{c_i, open} / V_{c_j, open}} \times 100$$

### Step D: Aggregating Overall Strength
A currency's overall strength is the arithmetic mean of its percentage changes against **all other 7 currencies**.

$$Strength(c) = \frac{1}{7} \sum_{j \neq c} \Delta(c, c_j)$$

**Why this works:**
If the EUR has a strength of `+0.5%`, it means the Euro has, on average, appreciated by 0.5% against the basket of the other 7 major currencies over the specified timeframe.

## 4. Timeframe Windows and Filtering

Financial markets have weekends and holidays where trading stops. A generic "minus 24 hours" timestamp might land in the middle of a weekend, yielding zero ticks.

To handle this, our backend data pipeline:
1. Determines the required `timeWindowMs` (e.g., 1 hour = 3,600,000 ms).
2. Fetches a buffer of historical data (e.g., past 5 days).
3. Defines the `latestTimestampMs` based on the *actual* most recent tick received (handling market closure gracefully).
4. Calculates the precise `cutoffTime` relative to the latest tick: `cutoffTime = latestTimestampMs - timeWindowMs`.
5. Filters all data points strictly within this active market window to build accurate history timelines and accurate opening prices.

## 5. Sparkline & Matrix Timelines

For visual matrix charts, the engine doesn't just calculate strength for the *current* moment. It loops through the entire array of synchronized historical ticks within the time window.
For every timestamp $t$, it calculates the relative strength of all currencies from $t_{open}$ to $t$, generating the data structures required for Recharts and SVG sparklines.
