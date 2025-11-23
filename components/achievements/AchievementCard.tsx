'use client';

import { Achievement, getRarityBgColor, getRarityTextColor } from '@/lib/achievements/definitions';
import AchievementBadge from './AchievementBadge';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface AchievementCardProps {
  achievement: Achievement & {
    isUnlocked: boolean;
    unlockedAt?: Date;
    progress?: { current: number; max: number } | null;
  };
}

export default function AchievementCard({ achievement }: AchievementCardProps) {
  const progressPercentage = achievement.progress
    ? (achievement.progress.current / achievement.progress.max) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white/10 backdrop-blur-md
        rounded-xl p-6 border-2
        ${achievement.isUnlocked
          ? 'border-aurelia-lime/50'
          : 'border-white/10'
        }
        transition-all duration-300
        hover:bg-white/15
      `}
    >
      <div className="flex items-start gap-4">
        {/* Badge */}
        <div className="flex-shrink-0">
          <AchievementBadge
            achievement={achievement}
            size="medium"
            showProgress={true}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title & Category */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`text-lg font-bold ${achievement.isUnlocked ? 'text-white' : 'text-white/60'}`}>
              {achievement.title}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${achievement.isUnlocked ? 'bg-aurelia-lime/20 text-aurelia-lime' : 'bg-white/10 text-white/40'} font-semibold`}>
              {achievement.category}
            </span>
          </div>

          {/* Description */}
          <p className={`text-sm mb-3 ${achievement.isUnlocked ? 'text-white/80' : 'text-white/40'}`}>
            {achievement.description}
          </p>

          {/* Progress Bar (for locked achievements) */}
          {!achievement.isUnlocked && achievement.progress && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                <span>Progress</span>
                <span className="font-semibold">
                  {achievement.progress.current} / {achievement.progress.max}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full gradient-aurelia-lime"
                />
              </div>
            </div>
          )}

          {/* Unlocked Date */}
          {achievement.isUnlocked && achievement.unlockedAt && (
            <div className="flex items-center gap-2 text-xs text-aurelia-lime">
              <span>🎉</span>
              <span>Unlocked on {format(achievement.unlockedAt, 'MMM d, yyyy')}</span>
            </div>
          )}

          {/* Locked Message */}
          {!achievement.isUnlocked && (
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span>🔒</span>
              <span>Keep going to unlock this achievement!</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
