import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Clock, Crosshair, BarChart2, Zap, Settings, Globe, Calendar as CalendarIcon, Loader2, LineChart } from 'lucide-react';
import { useRealCurrencyData, Timeframe, Currency } from '../lib/realEngine';
import { cn } from '../lib/utils';
import { Sparkline } from './Sparkline';
import EconomicCalendarWidget from './EconomicCalendarWidget';
import StrengthOverviewChart from './StrengthOverviewChart';

const TIMEFRAMES: Timeframe[] = ['15M', '1H', '1D', '1W'];

const PAIR_MAP: Record<Currency, string> = {
  USD: 'EURUSD',
  EUR: 'EURUSD',
  GBP: 'GBPUSD',
  JPY: 'USDJPY',
  AUD: 'AUDUSD',
  NZD: 'NZDUSD',
  CAD: 'USDCAD',
  CHF: 'USDCHF',
};

export default function CommandCenter() {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const { strengths, loading, chartData } = useRealCurrencyData(timeframe);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time as HH:MM:SS
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  const getTzTime = (tz: string) => {
    try {
      return currentTime.toLocaleTimeString('en-US', { ...timeOptions, timeZone: tz });
    } catch (e) {
      return '--:--:--';
    }
  };

  const tokyoTime = getTzTime('Asia/Tokyo');
  const londonTime = getTzTime('Europe/London');
  const nyTime = getTzTime('America/New_York');
  const sydneyTime = getTzTime('Australia/Sydney');

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 flex flex-col gap-6 selection:bg-neon-cyan/30">
      
      {/* PREMIUM HEADER ENHANCEMENT */}
      <header className="flex flex-col gap-5 border border-white/5 rounded-xl bg-black/20 backdrop-blur-xl shadow-2xl overflow-hidden pb-4">
        {/* World Clocks Bar */}
        <div className="flex justify-between items-center px-6 py-2 border-b border-white/5 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent text-[10px] uppercase font-mono tracking-widest text-gray-500">
          <div className="flex items-center gap-6 md:gap-10 overflow-x-auto no-scrollbar whitespace-nowrap hidden-scrollbar">
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-neon-amber/80 shadow-[0_0_8px_rgba(255,171,0,0.8)]"></span> SYD <span className="text-gray-300 ml-1">{sydneyTime}</span></div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-neon-green/80 shadow-[0_0_8px_rgba(0,230,118,0.8)]"></span> TYO <span className="text-gray-300 ml-1">{tokyoTime}</span></div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-neon-green/80 shadow-[0_0_8px_rgba(0,230,118,0.8)]"></span> LON <span className="text-gray-300 ml-1">{londonTime}</span></div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-neon-amber/80 shadow-[0_0_8px_rgba(255,171,0,0.8)]"></span> NYC <span className="text-gray-300 ml-1">{nyTime}</span></div>
          </div>
          <div className="hidden lg:flex gap-6 shrink-0">
            <span>DATA FEED: <span className="text-neon-cyan ml-1">YAHOO FINANCE VIA REST</span></span>
            <span>SYSTEM: <span className="text-neon-cyan ml-1">ONLINE</span></span>
            <span className="flex items-center gap-1">LATENCY: <span className="text-neon-cyan ml-1 flex items-center gap-1">12ms <Activity size={10} className="animate-pulse" /></span></span>
          </div>
        </div>

        {/* Main Header Content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-6">
          {/* Brand/Logo Area */}
          <div className="flex items-center gap-4">
            <div className="relative p-2.5 bg-gradient-to-tr from-gray-900 to-black rounded-lg border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-neon-cyan/5 rounded-lg blur-md" />
              <Activity size={24} className="text-neon-cyan relative z-10" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-1">
                Quant<span className="font-light text-neon-cyan opacity-90">Alpha</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase flex items-center gap-1.5 mt-0.5">
                <Globe size={10} className="opacity-70" /> Institutional FX Analytics
              </p>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex gap-6 shrink-0 text-[10px] uppercase font-mono text-gray-500">
              <span className="flex items-center gap-1">MATRIX <span className="text-neon-cyan/70 ml-1">LIVE</span></span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN BENTO GRID */}
      <main className="flex-1 flex flex-col gap-6">
        
        {/* MATRIX OVERVIEW SECTION (FULL WIDTH) */}
        <div className="glass-panel rounded-xl overflow-hidden flex flex-col border border-white/5 relative h-[400px] sm:h-[500px] lg:h-[550px]">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-30" />
          <div className="p-4 border-b border-white/5 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-sm font-mono text-neon-cyan uppercase tracking-widest flex items-center gap-2">
              <LineChart size={16} className="opacity-70" /> Relative Strength Matrix
            </h2>
            {/* Timeframe Tabs */}
            <div className="flex items-center bg-[#050507] p-1 rounded-lg border border-white/5 shadow-inner w-full sm:w-auto justify-between">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={cn(
                    "px-4 py-1.5 sm:px-5 sm:py-1 rounded-md text-[11px] font-mono font-medium transition-all duration-300 relative flex-1 sm:flex-none text-center",
                    timeframe === tf 
                      ? "text-white shadow-lg" 
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                  )}
                >
                  {timeframe === tf && (
                    <motion.div 
                      layoutId="active-tf-chart-pill"
                      className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 border border-t-white/10 border-b-black border-x-black rounded-md -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {timeframe === tf && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-neon-cyan rounded-t-full shadow-[0_0_8px_rgba(0,243,255,0.8)]" />
                  )}
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-black/50 w-full h-full p-2 relative">
            <StrengthOverviewChart data={chartData} timeframe={timeframe} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">


        
        {/* LEFT COLUMN: STRENGTH MATRIX */}
        <section className="lg:col-span-4 flex flex-col gap-4 glass-panel p-5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-neon-amber" /> Real-time Strength
            </h2>
            <div className="flex items-center gap-3">
              {loading && <Loader2 size={14} className="text-neon-cyan animate-spin" />}
              <Settings size={14} className="text-gray-500 cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>
          
          {/* List of Currencies */}
          <div className="flex flex-col gap-3 relative">
            <AnimatePresence>
              {strengths.map((item, index) => {
                const maxStrength = Math.max(...strengths.map(s => Math.abs(s.strength)));
                const normalizedStr = maxStrength === 0 ? 0 : item.strength / maxStrength; // -1 to 1
                
                // Color mapping: strong = green/cyan, weak = red/amber
                const isStrong = item.strength >= 0;
                const barColor = isStrong ? 'bg-neon-green' : 'bg-neon-red';
                const textCol = isStrong ? 'text-neon-green' : 'text-neon-red';
                const widthPct = Math.max(5, Math.abs(normalizedStr) * 100);

                return (
                  <motion.div
                    layout
                    key={item.currency}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onClick={() => setSelectedCurrency(item.currency)}
                    className={cn(
                      "group relative p-3 rounded-lg border border-white/5 bg-black/40 cursor-pointer transition-all duration-300 overflow-hidden",
                      selectedCurrency === item.currency ? "ring-1 ring-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.15)]" : "hover:bg-white/5"
                    )}
                  >
                    {/* Background Bar (Power Bar) */}
                    <div className="absolute inset-y-0 left-0 w-full opacity-10 pointer-events-none flex">
                      <div className="w-1/2 border-r border-white/10" />
                      <div className="w-1/2" />
                    </div>
                    
                    {/* Actual Power Bar visual */}
                    <div 
                      className="absolute inset-y-0 opacity-15 transition-all duration-500"
                      style={{ 
                        left: isStrong ? '50%' : `calc(50% - ${widthPct/2}%)`,
                        width: `${widthPct/2}%`,
                        backgroundColor: isStrong ? '#00e676' : '#ff2a2a'
                      }}
                    />

                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4 w-1/3">
                        <span className="font-mono text-xl font-bold text-white w-12">{item.currency}</span>
                        <div className="flex flex-col">
                           <span className={cn("font-mono text-sm font-bold", textCol)}>
                             {item.strength > 0 ? '+' : ''}{(item.strength).toFixed(2)}%
                           </span>
                           <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                             Rank {index + 1}
                           </span>
                        </div>
                      </div>

                      <div className="w-24 h-8 flex-shrink-0">
                         <Sparkline data={item.history} width={96} height={32} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>

        {/* RIGHT COLUMN: DETAIL VIEW & CHARTS */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Trade Recommendation */}
            <div className="glass-panel p-5 rounded-xl md:col-span-1 flex flex-col relative overflow-hidden ring-1 ring-neon-amber/20 shadow-[0_0_20px_rgba(255,171,0,0.1)]">
               <div className="absolute -right-4 -top-4 text-neon-amber/5">
                 <Zap size={100} />
               </div>
               <h2 className="text-sm font-mono text-neon-amber uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                 <Crosshair size={14} /> Alpha Signal
               </h2>
               {strengths.length > 0 ? (() => {
                  const strong = strengths[0];
                  const weak = strengths[strengths.length - 1];
                  const iStrong = ['EUR', 'GBP', 'AUD', 'NZD', 'USD', 'CAD', 'CHF', 'JPY'].indexOf(strong.currency);
                  const iWeak = ['EUR', 'GBP', 'AUD', 'NZD', 'USD', 'CAD', 'CHF', 'JPY'].indexOf(weak.currency);
                  const pair = iStrong < iWeak ? `${strong.currency}/${weak.currency}` : `${weak.currency}/${strong.currency}`;
                  const action = iStrong < iWeak ? 'BUY' : 'SELL';
                  const bgGlow = action === 'BUY' ? 'bg-neon-green/10 text-neon-green border-neon-green/30' : 'bg-neon-red/10 text-neon-red border-neon-red/30';

                  return (
                    <div className="flex flex-col flex-1 relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-4xl font-mono font-bold text-white tracking-tighter">{pair}</span>
                        <span className={cn("px-3 py-1 rounded border font-mono font-bold text-sm", bgGlow)}>{action}</span>
                      </div>
                      <div className="mt-auto pt-4 border-t border-white/10 flex justify-between text-xs font-mono">
                        <div className="flex flex-col">
                           <span className="text-gray-500 mb-1">Strongest</span>
                           <span className="text-neon-green">+{strong.strength.toFixed(2)}% {strong.currency}</span>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-gray-500 mb-1">Weakest</span>
                           <span className="text-neon-red">{weak.strength.toFixed(2)}% {weak.currency}</span>
                        </div>
                      </div>
                    </div>
                  );
               })() : (
                 <div className="flex-1 flex items-center justify-center text-gray-500 font-mono text-sm relative z-10">Detecting Alpha...</div>
               )}
            </div>

            {/* Micro Metrics */}
            <div className="glass-panel p-5 rounded-xl md:col-span-2 flex flex-col relative overflow-hidden">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-6 opacity-5 pointer-events-none">
                 <span className="text-[120px] font-black font-mono leading-none">{selectedCurrency}</span>
              </div>
              <div className="mb-4 relative z-10">
                 <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Asset Analytics: {selectedCurrency}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 flex-1 relative z-10">
                <div className="flex flex-col justify-center">
                   <span className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Relative Str</span>
                   <span className={cn(
                     "text-3xl font-mono tracking-tight",
                     (strengths.find(s => s.currency === selectedCurrency)?.strength || 0) >= 0 ? "text-neon-green" : "text-neon-red"
                   )}>
                     {(strengths.find(s => s.currency === selectedCurrency)?.strength || 0) > 0 ? '+' : ''}{(strengths.find(s => s.currency === selectedCurrency)?.strength || 0).toFixed(2)}%
                   </span>
                </div>
                <div className="flex flex-col justify-center border-l border-white/10 pl-6">
                   <span className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Trend</span>
                   <span className={cn(
                     "text-3xl font-mono tracking-tight",
                     (strengths.find(s => s.currency === selectedCurrency)?.strength || 0) >= 0 ? "text-neon-green" : "text-neon-red"
                   )}>
                     {(strengths.find(s => s.currency === selectedCurrency)?.strength || 0) >= 0 ? "Bullish" : "Bearish"}
                   </span>
                </div>
                <div className="flex flex-col justify-center border-l border-white/10 pl-6">
                   <span className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Data Points</span>
                   <span className="text-3xl font-mono text-white tracking-tight flex items-center gap-2">
                     {strengths.find(s => s.currency === selectedCurrency)?.history.length || 0}
                     <Activity size={20} className="text-neon-cyan opacity-50" />
                   </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[400px]">
            {/* ECONOMIC CALENDAR WIDGET (FULL WIDTH SPAN) */}
            <div className="glass-panel rounded-xl overflow-hidden flex flex-col border border-white/5 relative h-full min-h-[400px]">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="p-3 border-b border-white/5 bg-black/40 flex items-center justify-between">
                <h2 className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <CalendarIcon size={14} className="text-neon-cyan" /> Economic Calendar
                </h2>
              </div>
              <div className="flex-1 bg-black w-full h-full p-1 relative">
                  {/* Fallback pattern while loading */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-[200%] h-[200%] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
                 </div>
                 <div className="relative w-full h-full z-10 rounded-lg overflow-hidden border border-white/5">
                   <EconomicCalendarWidget />
                 </div>
              </div>
            </div>
          </div>

        </section>
        </div>
      </main>
    </div>
  );
}
