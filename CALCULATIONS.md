# Currency Strength Calculations: The Relational Algorithm

To determine the true, underlying momentum of any currency, we cannot simply rely on a dollar-pegged index (like DXY). Instead, we must algorithmically pit every currency against **every other currency** in the matrix (Total 28 unique combinations) to filter out base noise. This mathematical framework guarantees high-fidelity, high-level reasoning.

## 1. Base Normalization vector $V$
The API supplies tick data for major dollar cross-pairs (`EURUSD`, `USDJPY`, `GBPUSD`, `AUDUSD`, `NZDUSD`, `USDCAD`, `USDCHF`). We first normalize these to find the Base Normalization vector $V(c)$ where $c$ is the isolated currency relative to a $1.00$ USD baseline.

$V(\text{EUR}) = \text{EURUSD}$
$V(\text{JPY}) = 1 / \text{USDJPY}$

## 2. The Complete Relational Matrix Calculation
For any two currencies $x$ and $y$, the synthetic exchange rate $E_{x/y}$ is defined as:
$$E_{x/y} = \frac{V(x)}{V(y)}$$

Let $O_{x/y}$ be the opening exchange rate at the start of the timeframe (e.g., 24 hours ago), and $C_{x/y}$ be the current exchange rate.
The fractional delta ($\Delta_{x/y}$) is the true percentage return of currency $x$ denominated in currency $y$:

$$\Delta_{x/y} = \left( \frac{C_{x/y} - O_{x/y}}{O_{x/y}} \right) \times 100$$

## 3. The Absolute Strength Index (ASI)
To evaluate the true market supremacy of currency $x$ (e.g., `EUR`), we do not simply look at `EURUSD`. Instead, we aggregate its performance against all other 7 global currencies, finding its mean net strength:

$$ ASI_x = \frac{1}{7} \sum_{y \neq x} \Delta_{x/y} $$

This is exactly what the `calculateStrengthsAt` function executes iteratively. If $ASI_{\text{EUR}} > +0.5\%$, it implies the Euro is broadly acting as an aggressive market leader, absorbing liquidity from nearly all counterparty nations, not just America. This approach ensures we judge a currency holistically across the entire macroeconomic landscape.

## 4. Timeframe Windows and Interpolation
Financial markets have weekends and holidays where trading halts. A generic "minus 24 hours" timestamp might land in the middle of a weekend, yielding zero ticks.

To handle this, our backend data pipeline:
1. Determines the `timeWindowMs` (e.g., 1 hour = 3,600,000 ms).
2. Sets `latestTimestampMs` based on the actual most recent tick received (handling market closure gracefully).
3. Defines `cutoffTime` relative to the latest tick.

## 5. Network Contingencies
When deployed to a cloud VPS via environments like Docker/Dokploy, institutional trading rate limits (such as IP blocks by data providers like Yahoo Finance) can sometimes disrupt the influx of live vector data. The server is engineered to detect network anomalies and instantly pipe the HTTP 502 data loss exceptions via WebSocket/REST, shifting the dashboard into a professional standby failure state, awaiting reconnection.
