'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface BiomarkerData {
  name: string;
  value: number;
  optimal: number;
  unit: string;
  status: 'optimal' | 'attention' | 'warning';
}

interface BiomarkerChartProps {
  biomarkers: Record<string, number>;
}

export default function BiomarkerChart({ biomarkers }: BiomarkerChartProps) {
  // Define optimal ranges and convert to chart data
  const biomarkerRanges: Record<string, { optimal: number; unit: string; min: number; max: number }> = {
    HbA1c: { optimal: 5.0, unit: '%', min: 4.0, max: 7.0 },
    Ferritin: { optimal: 70, unit: 'ng/mL', min: 0, max: 150 },
    CRP: { optimal: 1.0, unit: 'mg/L', min: 0, max: 10 },
    TSH: { optimal: 2.0, unit: 'mIU/L', min: 0, max: 5.0 },
    VitaminD: { optimal: 50, unit: 'ng/mL', min: 0, max: 100 },
    B12: { optimal: 500, unit: 'pg/mL', min: 0, max: 1000 },
  };

  const getStatus = (name: string, value: number): 'optimal' | 'attention' | 'warning' => {
    const ranges: Record<string, { optimal: [number, number]; attention: [number, number] }> = {
      HbA1c: { optimal: [4.0, 5.6], attention: [5.7, 6.4] },
      Ferritin: { optimal: [50, 150], attention: [30, 49] },
      CRP: { optimal: [0, 3], attention: [3, 10] },
      TSH: { optimal: [0.5, 2.5], attention: [2.6, 4.5] },
      VitaminD: { optimal: [40, 80], attention: [20, 39] },
      B12: { optimal: [400, 900], attention: [200, 399] },
    };

    const range = ranges[name];
    if (!range) return 'optimal';

    if (value >= range.optimal[0] && value <= range.optimal[1]) return 'optimal';
    if (value >= range.attention[0] && value <= range.attention[1]) return 'attention';
    return 'warning';
  };

  const chartData: BiomarkerData[] = Object.entries(biomarkers)
    .filter(([name]) => biomarkerRanges[name])
    .map(([name, value]) => ({
      name,
      value,
      optimal: biomarkerRanges[name].optimal,
      unit: biomarkerRanges[name].unit,
      status: getStatus(name, value),
    }));

  const getBarColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return '#10b981'; // green
      case 'attention':
        return '#f59e0b'; // amber
      case 'warning':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-aurelia-purple p-4 rounded-lg shadow-lg border border-white/10">
          <p className="font-semibold text-white">{data.name}</p>
          <p className="text-sm text-white/80">
            Your Value: <span className="font-medium text-aurelia-lime">{data.value} {data.unit}</span>
          </p>
          <p className="text-sm text-white/60">
            Optimal: <span className="font-medium">{data.optimal} {data.unit}</span>
          </p>
          <p className={`text-sm font-medium mt-1 ${
            data.status === 'optimal' ? 'text-green-400' :
            data.status === 'attention' ? 'text-amber-400' :
            'text-red-400'
          }`}>
            Status: {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-white/40">
        No biomarker data available for visualization
      </div>
    );
  }

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => value === 'value' ? 'Your Value' : 'Optimal Range'}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
            ))}
          </Bar>
          <Bar dataKey="optimal" fill="#d1d5db" opacity={0.3} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
