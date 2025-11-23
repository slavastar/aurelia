'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';

interface TrendDataPoint {
  date: string;
  value: number;
  timestamp: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  title: string;
  dataKey?: string;
  color?: string;
  unit?: string;
  showArea?: boolean;
  optimalRange?: { min: number; max: number };
}

export default function TrendChart({
  data,
  title,
  dataKey = 'value',
  color = '#9333ea',
  unit = '',
  showArea = false,
  optimalRange,
}: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
        <div className="text-center py-12 text-white/40">
          <p>No historical data available yet.</p>
          <p className="text-sm mt-2">Complete more analyses to see trends over time.</p>
        </div>
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map(point => ({
    ...point,
    formattedDate: format(new Date(point.timestamp), 'MMM d'),
    [dataKey]: point.value,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-aurelia-purple p-4 rounded-lg shadow-lg border border-white/10">
          <p className="font-semibold text-white">
            {format(new Date(data.timestamp), 'MMM d, yyyy')}
          </p>
          <p className="text-sm text-white/80 mt-1">
            Value: <span className="font-medium text-aurelia-lime">{data.value}{unit}</span>
          </p>
          {optimalRange && (
            <p className="text-xs text-white/60 mt-1">
              Optimal: {optimalRange.min}-{optimalRange.max}{unit}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate trend direction
  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const change = lastValue - firstValue;
  const percentChange = ((change / firstValue) * 100).toFixed(1);
  const isPositive = change > 0;

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <div className="flex items-center gap-2">
          {isPositive ? (
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{percentChange}%
          </span>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {showArea ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#d1d5db"
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#d1d5db"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2}
                fill={`url(#gradient-${dataKey})`}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#d1d5db"
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#d1d5db"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={3}
                dot={{ fill: color, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>{data.length} data points</span>
        <span>
          Latest: <span className="font-medium text-gray-900">{lastValue}{unit}</span>
        </span>
      </div>
    </div>
  );
}
