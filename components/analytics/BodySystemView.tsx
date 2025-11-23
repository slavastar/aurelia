'use client';

import { Heart, Brain, Zap, Shield, Activity, Droplet } from 'lucide-react';
import { Biomarker } from '@/types';

interface BodySystemViewProps {
  biomarkers: Record<string, Biomarker>;
}

interface SystemCategory {
  name: string;
  icon: React.ReactNode;
  color: string;
  biomarkers: string[];
  description: string;
}

const BODY_SYSTEMS: SystemCategory[] = [
  {
    name: 'Cardiovascular',
    icon: <Heart className="w-6 h-6" />,
    color: 'red',
    biomarkers: ['Total Cholesterol', 'LDL', 'HDL', 'Triglycerides', 'ApoB', 'CRP'],
    description: 'Heart and blood vessel health'
  },
  {
    name: 'Metabolic',
    icon: <Zap className="w-6 h-6" />,
    color: 'yellow',
    biomarkers: ['HbA1c', 'Glucose', 'Insulin', 'Triglycerides'],
    description: 'Energy and blood sugar regulation'
  },
  {
    name: 'Endocrine',
    icon: <Activity className="w-6 h-6" />,
    color: 'purple',
    biomarkers: ['TSH', 'T3', 'T4', 'Estrogen', 'Progesterone', 'Testosterone', 'Cortisol'],
    description: 'Hormone balance and regulation'
  },
  {
    name: 'Immune & Inflammation',
    icon: <Shield className="w-6 h-6" />,
    color: 'blue',
    biomarkers: ['CRP', 'WBC', 'ESR'],
    description: 'Immune function and inflammation'
  },
  {
    name: 'Hematologic',
    icon: <Droplet className="w-6 h-6" />,
    color: 'pink',
    biomarkers: ['Hemoglobin', 'Hematocrit', 'RBC', 'WBC', 'Platelets', 'Ferritin', 'Iron', 'TIBC'],
    description: 'Blood cell health and oxygen transport'
  },
  {
    name: 'Nutritional',
    icon: <Brain className="w-6 h-6" />,
    color: 'green',
    biomarkers: ['Vitamin D', 'Vitamin B12', 'Folate', 'Ferritin', 'Magnesium', 'Calcium'],
    description: 'Essential vitamins and minerals'
  }
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    red: { 
      bg: 'bg-red-500/10', 
      text: 'text-red-200', 
      border: 'border-red-500/20',
      icon: 'text-red-400'
    },
    yellow: { 
      bg: 'bg-yellow-500/10', 
      text: 'text-yellow-200', 
      border: 'border-yellow-500/20',
      icon: 'text-yellow-400'
    },
    purple: { 
      bg: 'bg-purple-500/10', 
      text: 'text-purple-200', 
      border: 'border-purple-500/20',
      icon: 'text-purple-400'
    },
    blue: { 
      bg: 'bg-blue-500/10', 
      text: 'text-blue-200', 
      border: 'border-blue-500/20',
      icon: 'text-blue-400'
    },
    pink: { 
      bg: 'bg-pink-500/10', 
      text: 'text-pink-200', 
      border: 'border-pink-500/20',
      icon: 'text-pink-400'
    },
    green: { 
      bg: 'bg-green-500/10', 
      text: 'text-green-200', 
      border: 'border-green-500/20',
      icon: 'text-green-400'
    }
  };
  return colors[color] || colors.purple;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'optimal':
      return 'bg-green-500/20 text-green-200';
    case 'normal':
      return 'bg-blue-500/20 text-blue-200';
    case 'borderline':
      return 'bg-yellow-500/20 text-yellow-200';
    case 'attention':
      return 'bg-orange-500/20 text-orange-200';
    case 'critical':
      return 'bg-red-500/20 text-red-200';
    default:
      return 'bg-white/10 text-white/60';
  }
};

export default function BodySystemView({ biomarkers }: BodySystemViewProps) {
  const getSystemBiomarkers = (systemBiomarkerNames: string[]) => {
    return systemBiomarkerNames
      .map(name => {
        const biomarker = Object.entries(biomarkers).find(
          ([key, _]) => key.toLowerCase() === name.toLowerCase() || 
                       key.toLowerCase().includes(name.toLowerCase())
        );
        return biomarker ? { name: biomarker[0], data: biomarker[1] } : null;
      })
      .filter(Boolean) as Array<{ name: string; data: Biomarker }>;
  };

  const calculateSystemHealth = (systemBiomarkers: Array<{ name: string; data: Biomarker }>) => {
    if (systemBiomarkers.length === 0) return { score: 0, status: 'unknown' };
    
    const statusScores: Record<string, number> = {
      optimal: 100,
      normal: 75,
      borderline: 50,
      attention: 25,
      critical: 0
    };

    const avgScore = systemBiomarkers.reduce((sum, b) => 
      sum + (statusScores[b.data.status] || 50), 0
    ) / systemBiomarkers.length;

    let status = 'unknown';
    if (avgScore >= 90) status = 'optimal';
    else if (avgScore >= 70) status = 'normal';
    else if (avgScore >= 50) status = 'borderline';
    else if (avgScore >= 25) status = 'attention';
    else status = 'critical';

    return { score: Math.round(avgScore), status };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Body Systems Overview
        </h2>
        <p className="text-white/60 mb-6">
          Your biomarkers organized by body system for a holistic health view
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BODY_SYSTEMS.map((system) => {
            const systemBiomarkers = getSystemBiomarkers(system.biomarkers);
            const health = calculateSystemHealth(systemBiomarkers);
            const colors = getColorClasses(system.color);

            if (systemBiomarkers.length === 0) return null;

            return (
              <div
                key={system.name}
                className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 transition-all hover:shadow-lg`}
              >
                {/* System Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`${colors.icon}`}>
                      {system.icon}
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${colors.text}`}>
                        {system.name}
                      </h3>
                      <p className="text-sm text-white/60">
                        {system.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${colors.text}`}>
                      {health.score}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(health.status)}`}>
                      {health.status}
                    </div>
                  </div>
                </div>

                {/* Biomarkers List */}
                <div className="space-y-2">
                  {systemBiomarkers.map(({ name, data }) => (
                    <div
                      key={name}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm">
                          {name}
                        </div>
                        <div className="text-xs text-white/40">
                          {data.value} {data.unit}
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(data.status)}`}>
                        {data.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          System Health Scoring
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-white/80">Optimal (90-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-white/80">Normal (70-89)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-white/80">Borderline (50-69)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm text-white/80">Attention (25-49)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-white/80">Critical (0-24)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
