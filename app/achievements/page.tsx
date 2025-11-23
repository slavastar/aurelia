'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, Award, Target, TrendingUp, Compass } from 'lucide-react';
import AchievementCard from '@/components/achievements/AchievementCard';
import AchievementBadge from '@/components/achievements/AchievementBadge';
import {
  getAllAchievementsWithProgress,
  getAchievementStats,
  trackPageVisit
} from '@/lib/achievements/tracker';
import { motion } from 'framer-motion';
import Header from '@/components/ui/Header';

type FilterType = 'all' | 'unlocked' | 'locked' | 'progress' | 'consistency' | 'goals' | 'improvement' | 'exploration';

export default function AchievementsPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);

  useEffect(() => {
    trackPageVisit('achievements');
    loadAchievements();
  }, []);

  const loadAchievements = () => {
    const all = getAllAchievementsWithProgress();
    setAchievements(all);

    const achievementStats = getAchievementStats();
    setStats(achievementStats);
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return achievement.isUnlocked;
    if (filter === 'locked') return !achievement.isUnlocked;
    return achievement.category === filter;
  });

  const categoryIcons: Record<string, any> = {
    progress: Trophy,
    consistency: Award,
    goals: Target,
    improvement: TrendingUp,
    exploration: Compass
  };

  return (
    <div className="min-h-screen bg-aurelia-purple-dark text-white">
      <Header />
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
          <Link href="/dashboard" className="inline-flex items-center text-white/60 hover:text-aurelia-lime mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-aurelia-text-lime mb-2">Your Achievements</h1>
              <p className="text-lg text-white/60">Track your milestones and celebrate your progress</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-aurelia-lime mb-1">
                {stats.unlocked}
              </div>
              <div className="text-sm text-white/60">
                Unlocked
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {stats.percentage}%
              </div>
              <div className="text-sm text-white/60">
                Completion
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {stats.byRarity.legendary}
              </div>
              <div className="text-sm text-white/60">
                Legendary
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-amber-400 mb-1">
                {stats.total}
              </div>
              <div className="text-sm text-white/60">
                Total
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'gradient-aurelia-lime text-aurelia-purple'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'unlocked'
                  ? 'gradient-aurelia-lime text-aurelia-purple'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              Unlocked
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'locked'
                  ? 'gradient-aurelia-lime text-aurelia-purple'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              Locked
            </button>
            <div className="w-px bg-white/10 mx-2"></div>
            {Object.entries(categoryIcons).map(([category, Icon]) => (
              <button
                key={category}
                onClick={() => setFilter(category as FilterType)}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  filter === category
                    ? 'gradient-aurelia-lime text-aurelia-purple'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Achievement Grid */}
        {filteredAchievements.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-12 text-center">
            <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              No achievements found
            </h3>
            <p className="text-white/60">
              Try a different filter or start your health journey to unlock achievements!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AchievementCard achievement={achievement} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Rarity Legend */}
        <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            Rarity Levels
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500"></div>
              <div>
                <div className="font-semibold text-white">Common</div>
                <div className="text-xs text-white/60">Easy to unlock</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
              <div>
                <div className="font-semibold text-white">Rare</div>
                <div className="text-xs text-white/60">Requires effort</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600"></div>
              <div>
                <div className="font-semibold text-white">Epic</div>
                <div className="text-xs text-white/60">Challenging</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"></div>
              <div>
                <div className="font-semibold text-white">Legendary</div>
                <div className="text-xs text-white/60">Ultimate goal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
