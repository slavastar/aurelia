'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Activity } from 'lucide-react';
import RadarChart from '@/components/analytics/RadarChart';
import BodySystemView from '@/components/analytics/BodySystemView';
import { Biomarker } from '@/types';
import Header from '@/components/ui/Header';

export default function AnalyticsPage() {
  const router = useRouter();
  const [biomarkers, setBiomarkers] = useState<Record<string, Biomarker> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the most recent analysis from localStorage
    const stored = localStorage.getItem('aurelia_latest_analysis');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        
        // Convert biomarkers to the format expected by BodySystemView
        const formattedBiomarkers: Record<string, Biomarker> = {};
        
        Object.entries(data.biomarkers || {}).forEach(([key, value]) => {
          if (typeof value === 'number') {
            // Determine status based on value (simplified logic)
            let status: Biomarker['status'] = 'normal';
            
            // Example status determination (you can enhance this)
            if (key === 'HbA1c') {
              if (value < 5.7) status = 'optimal';
              else if (value < 6.5) status = 'borderline';
              else status = 'attention';
            } else if (key === 'Ferritin') {
              if (value >= 50 && value <= 150) status = 'optimal';
              else if (value >= 30 && value < 50) status = 'normal';
              else if (value < 30) status = 'attention';
            } else if (key === 'CRP') {
              if (value < 1) status = 'optimal';
              else if (value < 3) status = 'normal';
              else if (value < 10) status = 'borderline';
              else status = 'attention';
            }
            
            formattedBiomarkers[key] = {
              value,
              unit: getUnit(key),
              status,
              referenceRange: getReferenceRange(key)
            };
          }
        });
        
        setBiomarkers(formattedBiomarkers);
      } catch (error) {
        console.error('Error loading analysis:', error);
      }
    }
    setLoading(false);
  }, []);

  const getUnit = (biomarker: string): string => {
    const units: Record<string, string> = {
      'HbA1c': '%',
      'Ferritin': 'ng/mL',
      'CRP': 'mg/L',
      'TSH': 'mIU/L',
      'VitaminD': 'ng/mL',
      'VitaminB12': 'pg/mL',
      'Glucose': 'mg/dL',
      'Hemoglobin': 'g/dL',
      'TotalCholesterol': 'mg/dL',
      'LDL': 'mg/dL',
      'HDL': 'mg/dL',
      'Triglycerides': 'mg/dL',
    };
    return units[biomarker] || 'units';
  };

  const getReferenceRange = (biomarker: string): { min: number; max: number } | undefined => {
    const ranges: Record<string, { min: number; max: number }> = {
      'HbA1c': { min: 4.0, max: 5.6 },
      'Ferritin': { min: 30, max: 150 },
      'CRP': { min: 0, max: 3 },
      'TSH': { min: 0.4, max: 4.0 },
      'VitaminD': { min: 30, max: 100 },
    };
    return ranges[biomarker];
  };

  const getRadarData = () => {
    if (!biomarkers) return [];

    const categories = [
      { key: 'HbA1c', name: 'Metabolic', weight: 1 },
      { key: 'Ferritin', name: 'Energy', weight: 1 },
      { key: 'CRP', name: 'Inflammation', weight: 1 },
      { key: 'TSH', name: 'Thyroid', weight: 1 },
      { key: 'VitaminD', name: 'Nutrition', weight: 1 },
      { key: 'HDL', name: 'Cardiovascular', weight: 1 },
    ];

    return categories.map(cat => {
      const biomarker = biomarkers[cat.key];
      let score = 50; // default

      if (biomarker) {
        // Convert status to score
        const statusScores: Record<string, number> = {
          optimal: 100,
          normal: 75,
          borderline: 50,
          attention: 25,
          critical: 10
        };
        score = statusScores[biomarker.status] || 50;
      }

      return {
        category: cat.name,
        value: score,
        fullMark: 100
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aurelia-lime mx-auto"></div>
          <p className="mt-4 text-white/60">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!biomarkers || Object.keys(biomarkers).length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-white/60 hover:text-aurelia-lime transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-12 text-center">
            <Activity className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              No Analysis Data Available
            </h2>
            <p className="text-white/60 mb-6">
              Complete an analysis first to view your advanced analytics
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 gradient-aurelia-lime text-aurelia-purple px-6 py-3 rounded-lg hover:opacity-90 transition"
            >
              Start Analysis
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const radarData = getRadarData();

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-white/60 hover:text-aurelia-lime transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Advanced Analytics
              </h1>
              <p className="text-white/60 mt-1">
                Deep dive into your health data
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          <button className="px-6 py-3 gradient-aurelia-lime text-aurelia-purple rounded-lg font-medium whitespace-nowrap">
            <TrendingUp className="w-5 h-5 inline mr-2" />
            Overview
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-white/5 text-white/60 rounded-lg font-medium hover:bg-white/10 hover:text-white transition whitespace-nowrap"
          >
            Trends
          </Link>
          <Link
            href="/recommendations"
            className="px-6 py-3 bg-white/5 text-white/60 rounded-lg font-medium hover:bg-white/10 hover:text-white transition whitespace-nowrap"
          >
            Recommendations
          </Link>
        </div>

        {/* Radar Chart */}
        <div className="mb-8">
          <RadarChart 
            data={radarData}
            title="Multi-Dimensional Health Profile"
          />
        </div>

        {/* Body Systems View */}
        <BodySystemView biomarkers={biomarkers} />

        {/* Info Card */}
        <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-2">
            Understanding Your Analytics
          </h3>
          <p className="text-white/80 text-sm leading-relaxed">
            These advanced visualizations help you understand how different aspects of your health 
            interconnect. The radar chart shows your overall health balance across key dimensions, 
            while the body systems view organizes your biomarkers by physiological function. 
            Use these insights to identify areas for improvement and track your progress over time.
          </p>
        </div>
      </div>
    </div>
  );
}
