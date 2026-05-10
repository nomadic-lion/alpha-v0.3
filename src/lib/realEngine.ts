import { useEffect, useState } from 'react';

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF'] as const;
export type Currency = typeof CURRENCIES[number];

export type Timeframe = '15M' | '1H' | '1D' | '1W';

export interface CurrencyStrength {
  currency: Currency;
  strength: number; // percentage value
  history: number[]; // sparkline data
}

export function useRealCurrencyData(timeframe: Timeframe) {
  const [strengths, setStrengths] = useState<CurrencyStrength[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey(prev => prev + 1);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/forex?timeframe=${timeframe}&t=${Date.now()}`);
        const contentType = res.headers.get("content-type");
        
        if (!res.ok) {
          const text = await res.text();
          let msg = `Server Error (${res.status})`;
          try {
            const json = JSON.parse(text);
            msg = json.message || json.error || msg;
          } catch (e) {
            // Not JSON
          }
          throw new Error(msg);
        }

        if (!contentType || !contentType.includes("application/json")) {
           throw new Error("Server returned non-JSON response. This might be a temporary connection issue.");
        }

        const data = await res.json();
        
        if (data.success && data.pairsData) {
          const pd = data.pairsData;
          const timestamps = data.timestamps || [];

          // Normalize prices to USD value
          // V(c) = value of 1 unit of currency c in USD
          const getV = (c: Currency, source: Record<string, any>, index?: number) => {
             if (c === 'USD') return 1.0;
             if (c === 'EUR') return getPrice(pd['EURUSD=X'], source, index);
             if (c === 'GBP') return getPrice(pd['GBPUSD=X'], source, index);
             if (c === 'AUD') return getPrice(pd['AUDUSD=X'], source, index);
             if (c === 'NZD') return getPrice(pd['NZDUSD=X'], source, index);
             
             // Inverted pairs
             if (c === 'JPY') return 1.0 / getPrice(pd['JPY=X'], source, index);
             if (c === 'CAD') return 1.0 / getPrice(pd['CAD=X'], source, index);
             if (c === 'CHF') return 1.0 / getPrice(pd['CHF=X'], source, index);
             return 1.0;
          };

          const getPrice = (pairData: any, source: Record<string, any>, index?: number) => {
             if (!pairData) return 1.0;
             if (index !== undefined && pairData.history) {
                // Return history point, clamp index to available length
                const idx = Math.min(index, pairData.history.length - 1);
                return pairData.history[idx] || pairData.openPrice;
             }
             return pairData.currentPrice;
          };

          const maxHistory = timestamps.length;

          // Build history points
          const historyStrengths: Record<Currency, number[]> = {} as any;
          CURRENCIES.forEach(c => historyStrengths[c] = []);

          const newChartData: any[] = [];

          for (let i = 0; i < maxHistory; i++) {
             const points = calculateStrengthsAt(getV, pd, i);
             const chartPoint: any = { timestamp: timestamps[i] || `Point ${i}` };
             points.forEach(p => {
               historyStrengths[p.currency].push(p.strength);
               chartPoint[p.currency] = p.strength;
             });
             newChartData.push(chartPoint);
          }

          const currentS = calculateStrengthsAt(getV, pd);
          currentS.forEach(s => {
             s.history = historyStrengths[s.currency] || [];
          });

          // Sort by strength descending
          currentS.sort((a, b) => b.strength - a.strength);
          setStrengths(currentS);
          setChartData(newChartData);
          setLoading(false);
          setError(null);
        } else if (data.error) {
          setError(data.message || data.error);
          setLoading(false);
        } else {
          setError("Failed to process market data correctly.");
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Failed to fetch real forex data:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Market Data Unreachable: ${errorMessage}`);
        setLoading(false);
      }
    };

    fetchData();

    // Auto-refresh every 30 seconds for real data (less aggressive to respect proxy)
    intervalId = setInterval(fetchData, 30000);

    return () => clearInterval(intervalId);
  }, [timeframe, refreshKey]);

  return { strengths, loading, error, chartData, refresh };
}

function calculateStrengthsAt(getV: Function, pd: any, index?: number): CurrencyStrength[] {
    const deltaMap: Record<string, Record<string, number>> = {};
    CURRENCIES.forEach(c => { deltaMap[c] = {}; });

    // Calculate open values vs current/historical values
    const openValues: Record<string, number> = {};
    const measureValues: Record<string, number> = {};

    CURRENCIES.forEach(c => {
       const measureVal = getV(c, pd, index);
       let openVal = measureVal; // Default to 0 delta

       if (index !== undefined) {
           // Base all historical calculations from the first candle (open)
           // to plot cumulative relative strength over time.
           openVal = getOpenV(c, pd);
       } else if (index === undefined) {
           // For current live strength scalar
           openVal = getOpenV(c, pd);
       }

       openValues[c] = openVal;
       measureValues[c] = measureVal;
    });

    CURRENCIES.forEach(base => {
        CURRENCIES.forEach(quote => {
            if (base === quote) return;
            // pair: base/quote
            const openBaseQuote = openValues[base] / openValues[quote];
            const measureBaseQuote = measureValues[base] / measureValues[quote];
            
            const deltaPct = ((measureBaseQuote - openBaseQuote) / openBaseQuote) * 100;
            deltaMap[base][quote] = deltaPct;
        });
    });

    return CURRENCIES.map(curr => {
        let totalDelta = 0;
        let count = 0;
        for (const [_, delta] of Object.entries(deltaMap[curr])) {
            totalDelta += delta;
            count++;
        }
        const strength = totalDelta / Math.max(1, count);
        return {
            currency: curr as Currency,
            strength,
            history: [],
        };
    });
}

function getOpenV(c: Currency, pd: any) {
    const p = (pair: any) => pair ? (pair.openPrice || pair.currentPrice) : 1.0;
    if (c === 'USD') return 1.0;
    if (c === 'EUR') return p(pd['EURUSD=X']);
    if (c === 'GBP') return p(pd['GBPUSD=X']);
    if (c === 'AUD') return p(pd['AUDUSD=X']);
    if (c === 'NZD') return p(pd['NZDUSD=X']);
    
    // Inverted pairs
    if (c === 'JPY') return 1.0 / p(pd['JPY=X']);
    if (c === 'CAD') return 1.0 / p(pd['CAD=X']);
    if (c === 'CHF') return 1.0 / p(pd['CHF=X']);
    return 1.0;
}
