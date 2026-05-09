import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({ 
  data, 
  width = 120, 
  height = 40, 
  color = '#00f3ff',
  className = ''
}) => {
  if (!data || data.length === 0) return <div style={{width, height}} className={className} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = height * 0.2; // 20% padding top/bottom
  const usableHeight = height - padding * 2;

  const points = data.map((val, i) => {
    const x = (i / Math.max(1, data.length - 1)) * width;
    const y = height - padding - ((val - min) / range) * usableHeight;
    return `${x},${y}`;
  }).join(' ');

  const isPositive = data[data.length - 1] >= 0;
  const finalColor = isPositive ? '#00e676' : '#ff2a2a'; // Green if up, Red if down
  // Override color if passed explicitly or use trend color
  const strokeColor = color !== '#00f3ff' ? color : finalColor;

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};
