import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { Currency } from '../lib/realEngine';

interface Props {
  data: any[];
  timeframe?: string;
}

const COLORS: Record<Currency, string> = {
  USD: '#ffffff',
  EUR: '#3b82f6', // blue
  GBP: '#a855f7', // purple
  JPY: '#ef4444', // red
  AUD: '#f59e0b', // amber
  NZD: '#10b981', // emerald
  CAD: '#ec4899', // pink
  CHF: '#64748b', // slate
};

export default function StrengthOverviewChart({ data, timeframe }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 font-mono text-sm opacity-50">
        <div className="w-16 h-16 border-4 border-white/5 border-t-neon-cyan rounded-full animate-spin mb-4" />
        Processing Matrix Timelines...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
      >
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={(tick) => {
            if (!tick || tick.startsWith('Point')) return tick;
            const d = new Date(tick);
            if (timeframe === '1W') {
              return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
            }
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }}
          stroke="#333" 
          tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }}
          dy={10}
        />
        <YAxis 
          stroke="#333" 
          tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }}
          tickFormatter={(val) => `${val > 0 ? '+' : ''}${val.toFixed(1)}%`}
          orientation="right"
          dx={10}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#050507', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontFamily: 'monospace', padding: '12px' }}
          itemStyle={{ fontSize: '12px', padding: '2px 0', fontWeight: 'bold' }}
          labelStyle={{ color: '#aaa', fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase' }}
          labelFormatter={(label) => {
            if (!label || String(label).startsWith('Point')) return label;
            return new Date(label).toLocaleString();
          }}
          formatter={(value: number, name: string) => [`${value > 0 ? '+' : ''}${value.toFixed(2)}%`, name]}
        />
        <Legend 
          iconType="circle" 
          wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} 
        />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
        
        {(Object.keys(COLORS) as Currency[]).map((currency) => (
          <Line
            key={currency}
            type="monotone"
            dataKey={currency}
            stroke={COLORS[currency]}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: '#fff' }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
