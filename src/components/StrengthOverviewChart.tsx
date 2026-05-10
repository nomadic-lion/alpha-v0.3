import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend, CartesianGrid } from 'recharts';
import { useMediaQuery } from 'usehooks-ts';
import { Currency } from '../lib/realEngine';
import { cn } from '../lib/utils';

interface Props {
  data: any[];
  timeframe?: string;
}

const COLORS: Record<Currency, string> = {
  USD: '#ffffff',
  EUR: '#3b82f6', // Bright Blue
  GBP: '#d946ef', // Fuchsia
  JPY: '#ef4444', // Red
  AUD: '#f59e0b', // Amber
  NZD: '#10b981', // Emerald
  CAD: '#ec4899', // Pink
  CHF: '#64748b', // Slate
};

export default function StrengthOverviewChart({ data, timeframe }: Props) {
  const [hoveredCurrency, setHoveredCurrency] = useState<Currency | null>(null);
  const [selectedLegendCurrency, setSelectedLegendCurrency] = useState<Currency | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Track disabled currencies (clicked in legend)
  const [disabledCurrencies, setDisabledCurrencies] = useState<Set<Currency>>(new Set());

  const handleLegendClick = (dataKey: Currency) => {
    // Logic: 
    // 1. If not visible, make visible and select.
    // 2. If visible but not selected, select.
    // 3. If visible and selected, make invisible (disable).
    
    if (disabledCurrencies.has(dataKey)) {
      setDisabledCurrencies(prev => {
        const next = new Set(prev);
        next.delete(dataKey);
        return next;
      });
      setSelectedLegendCurrency(dataKey);
    } else if (selectedLegendCurrency !== dataKey) {
      setSelectedLegendCurrency(dataKey);
    } else {
      setDisabledCurrencies(prev => {
        const next = new Set(prev);
        next.add(dataKey);
        return next;
      });
      setSelectedLegendCurrency(null);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 font-mono text-sm opacity-50">
        <div className="w-16 h-16 border-4 border-white/5 border-t-neon-cyan rounded-full animate-spin mb-4" />
        Initializing Matrix Intelligence...
      </div>
    );
  }

  // Calculate customized legend items
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-x-2 gap-y-1 pt-4 px-2 max-h-[120px] overflow-y-auto no-scrollbar">
        {payload.map((entry: any, index: number) => {
          const isActive = (hoveredCurrency === entry.dataKey) || (selectedLegendCurrency === entry.dataKey);
          const isDisabled = disabledCurrencies.has(entry.dataKey as Currency);
          return (
            <li 
              key={`item-${index}`} 
              tabIndex={0}
              role="button"
              aria-label={`Select ${entry.value}`}
              className={cn(
                "flex items-center gap-2 cursor-pointer font-mono text-[10px] sm:text-xs transition-all duration-300 px-3 py-2.5 sm:py-2 rounded-lg border", 
                isActive ? "bg-white/10 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)] scale-105" : "bg-transparent border-transparent hover:bg-white/5",
                isDisabled ? "opacity-20 grayscale" : "opacity-100",
                "touch-manipulation select-none"
              )}
              onMouseEnter={() => !isMobile && setHoveredCurrency(entry.dataKey)}
              onMouseLeave={() => !isMobile && setHoveredCurrency(null)}
              onClick={() => handleLegendClick(entry.dataKey)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLegendClick(entry.dataKey);
                }
              }}
            >
              <div 
                className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-transform", isActive && "scale-125")}
                style={{ backgroundColor: entry.color, boxShadow: (isActive && !isDisabled) ? `0 0 10px ${entry.color}` : 'none' }}
              />
              <span className="font-bold tracking-wider" style={{ color: isDisabled ? '#666' : (isActive ? '#fff' : '#ccc') }}>{entry.value}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 380 : "100%"}>
      <LineChart
        data={data}
        margin={{ top: isMobile ? 5 : 20, right: isMobile ? 5 : 30, left: isMobile ? -20 : 10, bottom: isMobile ? 5 : 20 }}
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
        
        <XAxis 
          dataKey="timestamp" 
          hide={isMobile}
          tickFormatter={(tick) => {
             if (!tick || tick.startsWith('Point')) return tick;
             const d = new Date(tick);
             if (timeframe === '1W' || timeframe === '1D') {
               return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
             }
             return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }}
          stroke="#444" 
          tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }}
          dy={15}
          tickMargin={5}
        />
        
        <YAxis 
          stroke="#444" 
          tick={{ fill: '#666', fontSize: isMobile ? 8 : 10, fontFamily: 'monospace' }}
          tickFormatter={(val) => `${val > 0 ? '+' : ''}${val.toFixed(1)}%`}
          orientation="right"
          dx={isMobile ? 5 : 15}
          tickMargin={5}
        />
        
        {!isMobile && (
          <Tooltip
            cursor={!isMobile} 
            contentStyle={{ 
              backgroundColor: 'rgba(2, 2, 5, 0.98)', 
              backdropFilter: 'blur(16px)', 
              border: '1px solid rgba(255,255,255,0.15)', 
              borderRadius: '12px', 
              fontFamily: 'monospace', 
              padding: '12px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
              fontSize: isMobile ? '10px' : '12px',
              zIndex: 1000
            }}
            itemStyle={{ padding: '2px 0' }}
            labelStyle={{ color: '#888', fontSize: '9px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}
            labelFormatter={(label) => {
               if (!label || String(label).startsWith('Point')) return label;
               const d = new Date(label);
               return isNaN(d.getTime()) ? label : d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            }}
            formatter={(value: number, name: string) => [`${value > 0 ? '+' : ''}${value.toFixed(2)}%`, name]}
          />
        )}
        
        <Legend content={renderLegend} wrapperStyle={{ position: 'relative', bottom: 0, paddingBottom: isMobile ? '15px' : '0' }} />
        
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
        
        {(Object.keys(COLORS) as Currency[]).map((currency) => {
          const isDisabled = disabledCurrencies.has(currency);
          if (isDisabled) return null;
          
          const isHighlighted = hoveredCurrency === currency || selectedLegendCurrency === currency;
          const isAnythingHighlighted = hoveredCurrency !== null || selectedLegendCurrency !== null;
          const isFaded = isAnythingHighlighted && !isHighlighted;
          const showDefault = !isAnythingHighlighted;
          
          return (
             <Line
              key={currency}
              type="basis" 
              dataKey={currency}
              stroke={COLORS[currency]}
              strokeWidth={isHighlighted ? 4 : (isFaded ? 0.75 : 1.75)}
              strokeOpacity={isHighlighted ? 1 : (showDefault ? 0.6 : 0.15)}
              dot={false}
              activeDot={isMobile ? false : { 
                r: isHighlighted ? 6 : 4, 
                strokeWidth: 2, 
                fill: COLORS[currency], 
                stroke: '#000',
                style: { filter: 'url(#glow)' } 
              }}
              isAnimationActive={!isMobile} 
              animationDuration={500}
              connectNulls
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
