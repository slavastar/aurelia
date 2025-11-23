'use client';

import { RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RadarChartProps {
  data: Array<{
    category: string;
    value: number;
    fullMark: number;
  }>;
  title?: string;
}

export default function RadarChart({ data, title }: RadarChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-aurelia-purple p-4 rounded-lg shadow-lg border border-white/10">
          <p className="font-semibold text-white">{data.category}</p>
          <p className="text-sm text-white/80 mt-1">
            Score: <span className="font-medium text-aurelia-lime">{data.value}</span> / {data.fullMark}
          </p>
          <p className="text-xs text-white/60 mt-1">
            {((data.value / data.fullMark) * 100).toFixed(0)}% of optimal
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
      {title && (
        <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      )}

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadar data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
            />
            <Radar
              name="Health Score"
              dataKey="value"
              stroke="#a3e635"
              fill="#a3e635"
              fillOpacity={0.6}
            />
            <Tooltip content={<CustomTooltip />} />
          </RechartsRadar>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
        <p className="text-sm text-white/80">
          <strong>How to read:</strong> Each axis represents a different health dimension.
          The closer to the edge, the better your score in that area. Aim for a balanced,
          well-rounded shape.
        </p>
      </div>
    </div>
  );
}
