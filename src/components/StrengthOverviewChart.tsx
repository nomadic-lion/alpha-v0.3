import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend, CartesianGrid } from 'recharts';
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
  
  // Track disabled currencies (clicked in legend)
  const [disabledCurrencies, setDisabledCurrencies] = useState<Set<Currency>>(new Set());

  const handleLegendClick = (dataKey: Currency) => {
    setDisabledCurrencies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey);
      } else {
        newSet.add(dataKey);
      }
      return newSet;
    });
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 font-mono text-sm opacity-50">
        <div className="w-16 h-16 border-4 border-white/5 border-t-neon-cyan rounded-full animate-spin mb-4" />
        Processing Matrix Timelines...
      </div>
    );
  }

  // Calculate customized legend items
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-4 pt-4 px-2">
        {payload.map((entry: any, index: number) => {
          const isActive = hoveredCurrency === entry.dataKey;
          const isDisabled = disabledCurrencies.has(entry.dataKey as Currency);
          return (
            <li 
              key={`item-${index}`} 
              className={cn(
                "flex items-center gap-2 cursor-pointer font-mono text-xs transition-all duration-300",
                isDisabled ? "opacity-30 grayscale" : (hoveredCurrency && !isActive ? "opacity-50" : "opacity-100 hover:scale-110")
              )}
              onMouseEnter={() => setHoveredCurrency(entry.dataKey)}
              onMouseLeave={() => setHoveredCurrency(null)}
              onClick={() => handleLegendClick(entry.dataKey)}
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color, boxShadow: isDisabled ? 'none' : `0 0 8px ${entry.color}80` }}
              />
              <span style={{ color: isDisabled ? '#666' : '#eee' }}>{entry.value}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
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
          tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }}
          tickFormatter={(val) => `${val > 0 ? '+' : ''}${val.toFixed(2)}%`}
          orientation="right"
          dx={15}
          tickMargin={5}
        />
        
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'rgba(5, 5, 7, 0.85)', 
            backdropFilter: 'blur(12px)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '8px', 
            fontFamily: 'monospace', 
            padding: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}
          itemStyle={{ fontSize: '13px', padding: '4px 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
          labelStyle={{ color: '#888', fontSize: '11px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
          labelFormatter={(label) => {
             if (!label || String(label).startsWith('Point')) return label;
             return new Date(label).toLocaleString();
          }}
          formatter={(value: number, name: string) => [`${value > 0 ? '+' : ''}${value.toFixed(3)}%`, name]}
        />
        
        <Legend content={renderLegend} />
        
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="4 4" />
        
        {(Object.keys(COLORS) as Currency[]).map((currency) => {
          const isDisabled = disabledCurrencies.has(currency);
          if (isDisabled) return null;
          
          const isFaded = hoveredCurrency && hoveredCurrency !== currency;
          const isHighlighted = hoveredCurrency === currency;
          const showDefault = !hoveredCurrency;
          
          return (
             <Line
              key={currency}
              type="basis" // Ultra-smooth curves
              dataKey={currency}
              stroke={COLORS[currency]}
              strokeWidth={isHighlighted ? 4 : (isFaded ? 0.75 : 1.5)}
              strokeOpacity={isHighlighted ? 1 : (showDefault ? 0.4 : 0.1)}
              dot={false}
              activeDot={{ r: isHighlighted ? 6 : 0, strokeWidth: 0, fill: COLORS[currency], style: { filter: 'url(#glow)' } }}
              isAnimationActive={true}
              animationDuration={500}
              style={{ zIndex: isHighlighted ? 10 : 1, filter: isHighlighted ? 'url(#glow)' : 'none' }}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
