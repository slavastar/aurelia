'use client';

import { Achievement, getRarityColor, getRarityTextColor, getRarityBgColor } from '@/lib/achievements/definitions';
import { Lock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface AchievementBadgeProps {
  achievement: Achievement & {
    isUnlocked: boolean;
    unlockedAt?: Date;
    progress?: { current: number; max: number } | null;
  };
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  onClick?: () => void;
}

export default function AchievementBadge({
  achievement,
  size = 'medium',
  showProgress = true,
  onClick
}: AchievementBadgeProps) {
  const sizeClasses = {
    small: 'w-16 h-16 text-2xl',
    medium: 'w-24 h-24 text-4xl',
    large: 'w-32 h-32 text-5xl'
  };

  const progressPercentage = achievement.progress
    ? (achievement.progress.current / achievement.progress.max) * 100
    : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Badge Circle */}
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full
          flex items-center justify-center
          relative
          ${achievement.isUnlocked
            ? `gradient-aurelia-lime text-aurelia-purple shadow-lg`
            : 'bg-white/10 text-white/20'
          }
          transition-all duration-300
        `}
      >
        {/* Icon */}
        <span className={`${achievement.isUnlocked ? 'opacity-100' : 'opacity-30'}`}>
          {achievement.icon}
        </span>

        {/* Lock Overlay for Locked Achievements */}
        {!achievement.isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
            <Lock className="w-6 h-6 text-white/60" />
          </div>
        )}

        {/* Check Mark for Unlocked */}
        {achievement.isUnlocked && (
          <div className="absolute -top-1 -right-1 bg-aurelia-lime rounded-full p-1">
            <Check className="w-3 h-3 text-aurelia-purple" />
          </div>
        )}

        {/* Progress Ring for Locked Achievements */}
        {!achievement.isUnlocked && showProgress && achievement.progress && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-white/10"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${progressPercentage * 2.827} 282.7`}
              className="text-aurelia-lime transition-all duration-500"
            />
          </svg>
        )}
      </div>

      {/* Rarity Indicator */}
      <div
        className={`
          absolute -bottom-2 left-1/2 transform -translate-x-1/2
          px-2 py-0.5 rounded-full text-xs font-bold
          ${getRarityBgColor(achievement.rarity)}
          ${getRarityTextColor(achievement.rarity)}
          border-2 border-white dark:border-gray-800
        `}
      >
        {achievement.rarity.toUpperCase()}
      </div>

      {/* Glow Effect for Unlocked Legendary */}
      {achievement.isUnlocked && achievement.rarity === 'legendary' && (
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
            zIndex: -1
          }}
        />
      )}
    </motion.div>
  );
}
