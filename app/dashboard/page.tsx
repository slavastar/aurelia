'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  TrendingUp,
  Calendar,
  Heart,
  Target,
  Clock,
  Award,
  AlertCircle,
  Lightbulb,
  Trophy
} from 'lucide-react';
import TrendChart from '@/components/dashboard/TrendChart';
import GoalTracker from '@/components/dashboard/GoalTracker';
import ProgressRing from '@/components/dashboard/ProgressRing';
import Link from 'next/link';
import {
  getHistory,
  getLatestEntry,
  getHealthScoreTrend,
  getBiomarkerTrend,
  getStatsSummary,
  getCommonRiskFactors,
} from '@/lib/storage/history';
import { motion } from 'framer-motion';
import Header from '@/components/ui/Header';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEntries: 0,
    latestScore: 0,
    averageScore: 0,
    improvement: 0,
    daysTracked: 0,
  });
  const [healthScoreTrend, setHealthScoreTrend] = useState<any[]>([]);
  const [commonRiskFactors, setCommonRiskFactors] = useState<any[]>([]);
  const [selectedBiomarker, setSelectedBiomarker] = useState('HbA1c');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const summary = getStatsSummary();
    setStats(summary);

    const scoreTrend = getHealthScoreTrend(10);
    setHealthScoreTrend(scoreTrend);

    const riskFactors = getCommonRiskFactors(5);
    setCommonRiskFactors(riskFactors);
  };

  const biomarkerTrend = getBiomarkerTrend(selectedBiomarker, 10);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (stats.totalEntries === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-12 text-center border border-white/10">
            <Activity className="w-16 h-16 text-aurelia-lime mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Welcome to Your Dashboard</h1>
            <p className="text-lg text-white/60 mb-8">
              Complete your first health analysis to start tracking your progress and see personalized insights.
            </p>
            <button
              onClick={() => router.push('/upload')}
              className="px-8 py-4 gradient-aurelia-lime text-aurelia-purple rounded-xl font-semibold hover:opacity-90 transition-all transform hover:scale-105"
            >
              Start Your First Analysis
            </button>
          </div>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold gradient-aurelia-text-lime mb-2">Your Health Dashboard</h1>
                <p className="text-lg text-white/60">Track your progress and insights over time</p>
              </div>
            </div>
          </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Latest Score */}
          <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Heart className="w-6 h-6 text-aurelia-lime" />
              </div>
              <span className="text-3xl font-bold gradient-aurelia-text-lime">
                {stats.latestScore}
              </span>
            </div>
            <h3 className="text-sm font-medium text-white/80">Latest Health Score</h3>
            <p className="text-xs text-white/60 mt-1">Out of 100</p>
          </motion.div>

          {/* Average Score */}
          <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-3xl font-bold text-blue-400">
                {stats.averageScore}
              </span>
            </div>
            <h3 className="text-sm font-medium text-white/80">Average Score</h3>
            <p className="text-xs text-white/60 mt-1">All time</p>
          </motion.div>

          {/* Improvement */}
          <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <span className={`text-3xl font-bold ${stats.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.improvement > 0 ? '+' : ''}{stats.improvement}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-white/80">Recent Change</h3>
            <p className="text-xs text-white/60 mt-1">vs. previous</p>
          </motion.div>

          {/* Days Tracked */}
          <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Calendar className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-3xl font-bold text-amber-400">
                {stats.daysTracked}
              </span>
            </div>
            <h3 className="text-sm font-medium text-white/80">Days Tracked</h3>
            <p className="text-xs text-white/60 mt-1">{stats.totalEntries} analyses</p>
          </motion.div>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Health Score Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TrendChart
              data={healthScoreTrend}
              title="Health Score Trend"
              color="#9333ea"
              showArea={true}
            />
          </motion.div>

          {/* Biomarker Trend */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Biomarker Trend</h3>
                <select
                  value={selectedBiomarker}
                  onChange={(e) => setSelectedBiomarker(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="HbA1c">HbA1c</option>
                  <option value="Ferritin">Ferritin</option>
                  <option value="CRP">CRP</option>
                  <option value="TSH">TSH</option>
                  <option value="VitaminD">Vitamin D</option>
                  <option value="B12">B12</option>
                </select>
              </div>
              {biomarkerTrend.length > 0 ? (
                <div className="h-[250px]">
                  <TrendChart
                    data={biomarkerTrend}
                    title=""
                    color="#ec4899"
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No data available for {selectedBiomarker}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Progress Rings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Health Dimensions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ProgressRing
              progress={stats.latestScore}
              color="#9333ea"
              label="Overall Health"
            />
            <ProgressRing
              progress={Math.min(stats.improvement + 50, 100)}
              color="#3b82f6"
              label="Improvement"
            />
            <ProgressRing
              progress={Math.min((stats.totalEntries / 10) * 100, 100)}
              color="#10b981"
              label="Consistency"
            />
            <ProgressRing
              progress={Math.min((stats.daysTracked / 30) * 100, 100)}
              color="#f59e0b"
              label="Tracking Streak"
            />
          </div>
        </motion.div>

        {/* Goal Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <GoalTracker />
        </motion.div>

        {/* Risk Factors & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Common Risk Factors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-900">Common Risk Factors</h3>
            </div>
            {commonRiskFactors.length > 0 ? (
              <div className="space-y-3">
                {commonRiskFactors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">
                      {factor.factor.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{ width: `${factor.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-12 text-right">
                        {factor.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No risk factors identified</p>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6" />
              <h3 className="text-lg font-bold">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/upload')}
                className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-left transition-colors backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">New Analysis</div>
                    <div className="text-xs text-purple-100">Upload new blood test results</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => router.push('/results')}
                className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-left transition-colors backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">View Latest Report</div>
                    <div className="text-xs text-purple-100">See your most recent analysis</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => router.push('/recommendations')}
                className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-left transition-colors backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">Action Plan</div>
                    <div className="text-xs text-purple-100">Get personalized recommendations</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => router.push('/analytics')}
                className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-left transition-colors backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">Advanced Analytics</div>
                    <div className="text-xs text-purple-100">Deep dive into your health data</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => router.push('/achievements')}
                className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-left transition-colors backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">Achievements</div>
                    <div className="text-xs text-purple-100">View your health milestones</div>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="flex justify-center gap-4"
        >
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
    </div>
  );
}
