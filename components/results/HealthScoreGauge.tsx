'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface HealthScoreGaugeProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
}

export default function HealthScoreGauge({ score, size = 'md' }: HealthScoreGaugeProps) {
  const sizes = {
    sm: { width: 200, height: 200, innerRadius: 60, outerRadius: 80, fontSize: 'text-2xl' },
    md: { width: 300, height: 300, innerRadius: 90, outerRadius: 120, fontSize: 'text-4xl' },
    lg: { width: 400, height: 400, innerRadius: 120, outerRadius: 160, fontSize: 'text-5xl' },
  };

  const config = sizes[size];

  // Normalize score to 0-100
  const normalizedScore = Math.max(0, Math.min(100, score));

  // Calculate percentage for the gauge
  const percentage = normalizedScore;
  const remaining = 100 - percentage;

  const data = [
    { name: 'Score', value: percentage },
    { name: 'Remaining', value: remaining },
  ];

  // Color based on score
  const getColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const color = getColor(normalizedScore);
  const label = getLabel(normalizedScore);

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: config.width, height: config.height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={config.innerRadius}
              outerRadius={config.outerRadius}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill={color} />
              <Cell fill="rgba(255,255,255,0.1)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Score display in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '40%' }}>
          <div className={`font-bold ${config.fontSize}`} style={{ color }}>
            {normalizedScore}
          </div>
          <div className="text-sm text-white/60 mt-1">out of 100</div>
          <div className="text-lg font-semibold mt-2" style={{ color }}>
            {label}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-white/60">0-39: Needs Attention</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-500"></div>
          <span className="text-white/60">40-59: Fair</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="text-white/60">60-79: Good</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-white/60">80-100: Excellent</span>
        </div>
      </div>
    </div>
  );
}
