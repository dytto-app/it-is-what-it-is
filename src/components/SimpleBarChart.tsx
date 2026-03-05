import React, { useState } from 'react';

interface BarData {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  data: BarData[];
  color?: string;
  height?: number;
  valuePrefix?: string;
}

/**
 * Lightweight SVG bar chart (~2KB vs recharts 364KB)
 * Supports simple vertical bar charts with labels and hover tooltips
 */
export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  color = '#60a5fa',
  height = 280,
  valuePrefix = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barCount = data.length;
  const labelHeight = 28; // Space for labels at bottom
  const chartHeight = height - labelHeight;

  return (
    <div style={{ width: '100%', height }} className="relative">
      {/* Chart bars */}
      <div 
        className="flex items-end justify-between h-full px-1"
        style={{ height: chartHeight }}
      >
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const isHovered = hoveredIndex === index;
          
          return (
            <div
              key={index}
              className="relative flex-1 mx-0.5 group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {isHovered && item.value > 0 && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                  <div className="bg-black/90 border border-slate-600 rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-xl">
                    <span className="font-bold text-white">
                      {valuePrefix}{item.value.toFixed(item.value < 10 ? 2 : 0)}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Bar */}
              <div
                className="w-full rounded-t-md transition-all duration-200"
                style={{
                  height: `${barHeight}%`,
                  minHeight: item.value > 0 ? 4 : 0,
                  backgroundColor: color,
                  opacity: isHovered ? 0.9 : 1,
                  transform: isHovered ? 'scaleY(1.02)' : 'scaleY(1)',
                  transformOrigin: 'bottom',
                }}
              />
            </div>
          );
        })}
      </div>
      
      {/* X-axis labels */}
      <div 
        className="flex justify-between px-1"
        style={{ height: labelHeight }}
      >
        {data.map((item, index) => (
          <div
            key={index}
            className="flex-1 mx-0.5 text-center text-slate-500 text-xs pt-2 select-none truncate"
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleBarChart;
