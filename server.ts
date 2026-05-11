import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache Engine to protect the Twelve Data 800 credits/day limit
const cache: Record<string, { data: any, timestamp: number }> = {
  "15M": { data: null, timestamp: 0 },
  "1H": { data: null, timestamp: 0 },
  "1D": { data: null, timestamp: 0 },
  "1W": { data: null, timestamp: 0 }
};

// Request Coalescing: prevents multiple simultaneous fetches for the same timeframe
const pendingFetches: Record<string, Promise<any> | null> = {};

// Cache Time-To-Live (TTL)
const TTL = {
  "15M": 20 * 60 * 1000, // 20 mins
  "1H": 2 * 60 * 60 * 1000, // 2 hours
  "1D": 8 * 60 * 60 * 1000, // 8 hours
  "1W": 24 * 60 * 60 * 1000 // 24 hours
};

// Symbol mapping: Yahoo Finance (frontend expects) -> Twelve Data
const symbolMap: Record<string, string> = {
  "EURUSD=X": "EUR/USD",
  "GBPUSD=X": "GBP/USD",
  "AUDUSD=X": "AUD/USD",
  "NZDUSD=X": "NZD/USD",
  "JPY=X": "USD/JPY",
  "CAD=X": "USD/CAD",
  "CHF=X": "USD/CHF"
};

const reverseMap: Record<string, string> = Object.fromEntries(
  Object.entries(symbolMap).map(([k, v]) => [v, k])
);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // API Route to get real FX data
  app.get("/api/forex", async (req, res) => {
    const { timeframe = "1D" } = req.query;
    const tf = String(timeframe);

    try {
      // 1. Check Shared Cache
      if (cache[tf] && cache[tf].data && (Date.now() - cache[tf].timestamp < (TTL[tf as keyof typeof TTL] || 0))) {
        return res.json(cache[tf].data);
      }

      // 2. Coalesce Requests: If a fetch is already in progress for this timeframe, wait for it
      if (pendingFetches[tf]) {
        console.log(`[COALESCE] Waiting for existing fetch for ${tf}`);
        const data = await pendingFetches[tf];
        return res.json(data);
      }

      // 3. Perform Fetch
      pendingFetches[tf] = (async () => {
        try {
          console.log(`[CACHE MISS] Fetching fresh forex data for timeframe: ${tf}`);
          
          const API_KEY = process.env.TWELVE_DATA_API_KEY;
          if (!API_KEY) {
            throw new Error("TWELVE_DATA_API_KEY is missing from environment variables.");
          }

          let interval = "1day";
          let outputsize = 30;

          switch (tf) {
            case "15M": interval = "15min"; outputsize = 120; break;
            case "1H": interval = "1h"; outputsize = 120; break;
            case "1D": interval = "1day"; outputsize = 30; break;
            case "1W": interval = "1week"; outputsize = 26; break;
          }

          const symbolsList = Object.values(symbolMap).join(",");
          const url = `https://api.twelvedata.com/time_series?symbol=${symbolsList}&interval=${interval}&outputsize=${outputsize}&timezone=UTC&apikey=${API_KEY}`;
          
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Twelve Data API returned ${response.status} ${response.statusText}`);
          }

          const json = await response.json();
          if (json.code && json.status === "error") {
            throw new Error(`Twelve Data Error: ${json.message}`);
          }

          const rawData: Record<string, Record<string, number>> = {};
          const allTimestamps = new Set<string>();

          for (const tdSymbol in json) {
            const item = json[tdSymbol];
            if (!item || !item.values || item.status === "error") continue;

            const baseSymbol = reverseMap[tdSymbol];
            if (!baseSymbol) continue;

            rawData[baseSymbol] = {};
            item.values.forEach((v: any) => {
              const d = new Date(v.datetime.replace(' ', 'T') + "Z");
              const timeStr = d.toISOString();
              allTimestamps.add(timeStr);
              rawData[baseSymbol][timeStr] = parseFloat(v.close);
            });
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
              history.push(lastClose);
            });

            if (lastClose !== null) {
              pairsData[symbol] = { openPrice, currentPrice: lastClose, history, timestamps: sortedTimestamps };
            }
          }

          const responsePayload = { 
            success: true, 
            pairsData, 
            timestamps: sortedTimestamps,
            lastUpdated: Date.now() 
          };

          // Update Shared Cache
          cache[tf] = { data: responsePayload, timestamp: Date.now() };
          return responsePayload;
        } finally {
          // Clean up pending fetch
          delete pendingFetches[tf];
        }
      })();

      const finalData = await pendingFetches[tf];
      res.json(finalData);
    } catch (e) {
      console.error(e);
      res.status(502).json({ success: false, error: "Market Data Unreachable", message: String(e) });
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

startServer();
