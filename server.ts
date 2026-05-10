import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // API Route to get real FX data
  app.get("/api/forex", async (req, res) => {
    console.log("Fetching forex data for timeframe:", req.query.timeframe);
    try {
      const { timeframe = "1D" } = req.query;
      
      const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF'];
      
      // We need prices for these against USD (or cross pairs directly).
      // Let's get the standard quotes. 
      // Base: USD
      // EURUSD=X, GBPUSD=X, AUDUSD=X, NZDUSD=X
      // USDJPY=X, USDCAD=X, USDCHF=X
      const symbols = [
        "EURUSD=X", "GBPUSD=X", "AUDUSD=X", "NZDUSD=X",
        "JPY=X", "CAD=X", "CHF=X"
      ];
      
      console.log("Symbols to fetch:", symbols);

      // To simplify, we just need current price and historical data for sparkline for the 7 major USD pairs.
      // With these 7 pairs, we can derive all 28 crosses and their relative strength.
      
      // Map interval for yahoo-finance
      let interval: "1m" | "2m" | "5m" | "15m" | "30m" | "1h" | "1d" | "1wk" = "1d" as any;
      let range = "1mo";
      let timeWindowMs = 0;

      const ONE_MINUTE = 60 * 1000;
      const ONE_HOUR = 60 * ONE_MINUTE;
      const ONE_DAY = 24 * ONE_HOUR;

      switch (timeframe) {
        case "15M": 
          interval = "15m"; 
          timeWindowMs = 24 * ONE_HOUR; // ~96 candles
          break;
        case "1H": 
          interval = "1h"; 
          timeWindowMs = 5 * ONE_DAY; // ~120 candles
          break;
        case "1D": 
          interval = "1d"; 
          timeWindowMs = 30 * ONE_DAY; // ~30 candles
          break;
        case "1W": 
          interval = "1wk";
          timeWindowMs = 180 * ONE_DAY; // ~26 candles
          break;
      }

      // Fetch chart data (historical) for sparklines and opening prices
      const results = {};
      const promises = symbols.map(async (symbol) => {
        try {
          // Always fetch past 5 days buffer to survive weekends
          const maxBufferMs = Math.max(timeWindowMs * 1.5, 5 * ONE_DAY);
          console.log(`Fetching ${symbol}...`);
          const chart = await yahooFinance.chart(symbol, {
            period1: new Date(Date.now() - maxBufferMs), 
            interval: interval
          });
          console.log(`Successfully fetched ${symbol}`);
          return { symbol, chart };
        } catch (e) {
          console.error(`Error fetching ${symbol}:`, e);
          return { symbol, error: true };
        }
      });

      const chartsData = await Promise.all(promises);
      
      const allFailed = chartsData.every(r => !r || r.error);
      if (allFailed) {
          console.error("Yahoo Finance API failed or blocked. Cannot fetch market data.");
          return res.status(502).json({ 
            success: false, 
            error: "Market Data Unreachable", 
            message: "Failed to fetch historical quotes from Yahoo Finance. This may be due to rate limiting or connection drops." 
          });
      }

      const rawData: Record<string, Record<string, number>> = {};
      const allTimestamps = new Set<string>();
      
      // Find the absolute latest timestamp across all data to handle weekends
      // Only consider valid quotes where close !== null
      let latestTimestampMs = 0;
      for (const res of chartsData) {
        if (!res || res.error) continue;
        const chartResult = res.chart as any;
        const quotes = chartResult.quotes;
        if (quotes && quotes.length > 0) {
          for (let i = quotes.length - 1; i >= 0; i--) {
            const q = quotes[i];
            if (q.close !== null && (q.date || q.timestamp)) {
              const d = q.date ? new Date(q.date) : new Date(q.timestamp);
              if (d.getTime() > latestTimestampMs) {
                latestTimestampMs = d.getTime();
              }
              break; // Found the latest valid quote for this symbol
            }
          }
        }
      }

      const cutoffTime = latestTimestampMs > 0 ? latestTimestampMs - timeWindowMs : Date.now() - timeWindowMs;

      for (const res of chartsData) {
        if (!res || res.error) continue;
        const baseSymbol = res.symbol; 
        const chartResult = res.chart as any;
        const quotes = chartResult.quotes;
        
        rawData[baseSymbol] = {};
        if (quotes && quotes.length > 0) {
          quotes.forEach((q: any) => {
             if (q.close !== null && (q.date || q.timestamp)) {
                const d = q.date ? new Date(q.date) : new Date(q.timestamp);
                let bucketMs = d.getTime();
                if (interval === "1m") bucketMs = bucketMs - (bucketMs % ONE_MINUTE);
                if (interval === "15m") bucketMs = bucketMs - (bucketMs % (15 * ONE_MINUTE));
                if (interval === "1h") bucketMs = bucketMs - (bucketMs % ONE_HOUR);
                if (interval === "1d") bucketMs = bucketMs - (bucketMs % ONE_DAY);
                if (interval === "1wk") bucketMs = bucketMs - (bucketMs % (7 * ONE_DAY));
                if (bucketMs >= cutoffTime) { // Filter relative to market time
                  const timeStr = new Date(bucketMs).toISOString();
                  allTimestamps.add(timeStr);
                  rawData[baseSymbol][timeStr] = q.close;
                }
             }
          });
        }
      }
      
      const sortedTimestamps = Array.from(allTimestamps).sort();

      const pairsData: Record<string, any> = {};
      
      for (const symbol in rawData) {
         const history: (number | null)[] = [];
         let lastClose: number | null = null;
         let openPrice: number | null = null;

         sortedTimestamps.forEach(ts => {
            const val = rawData[symbol][ts];
            if (val !== undefined && val !== null) {
               lastClose = val;
               if (openPrice === null) openPrice = val;
            }
            history.push(lastClose); // Forward fill
         });

         if (lastClose !== null) {
            pairsData[symbol] = {
               openPrice,
               currentPrice: lastClose,
               history,
               timestamps: sortedTimestamps
            };
         }
      }

      res.json({ success: true, pairsData, timestamps: sortedTimestamps });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: String(e) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

function getRangeMs(range: string) {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  switch (range) {
    case "1d": return ONE_DAY;
    case "5d": return 5 * ONE_DAY;
    case "1mo": return 30 * ONE_DAY;
    case "6mo": return 180 * ONE_DAY;
    default: return 30 * ONE_DAY;
  }
}

startServer();
