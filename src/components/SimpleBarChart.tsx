import React from 'react';

interface BarData {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  data: BarData[];
  color?: string;
  height?: number;
}

/**
 * Lightweight SVG bar chart (~2KB vs recharts 364KB)
 * Supports simple vertical bar charts with labels
 */
export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  color = '#60a5fa',
  height = 280,
}) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = 100 / data.length;
  const barPadding = 0.15; // 15% padding between bars
  const actualBarWidth = barWidth * (1 - barPadding);
  const barOffset = (barWidth * barPadding) / 2;
  
  // Chart area (leave space for labels at bottom)
  const chartHeight = height - 24;

  return (
    <div style={{ width: '100%', height }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = index * barWidth + barOffset;
          const y = chartHeight - barHeight;

          return (
            <g key={index}>
              {/* Bar with rounded top corners */}
              <rect
                x={`${x}%`}
                y={y}
                width={`${actualBarWidth}%`}
                height={barHeight}
                fill={color}
                rx={3}
                ry={3}
                className="transition-all duration-200 hover:opacity-80"
              />
              {/* Label */}
              <text
                x={`${x + actualBarWidth / 2}%`}
                y={height - 4}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="3"
                className="select-none"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default SimpleBarChart;
