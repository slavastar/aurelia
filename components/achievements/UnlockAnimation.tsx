'use client';

import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Achievement } from '@/lib/achievements/definitions';
import { UnlockedAchievement } from '@/lib/achievements/tracker';
import AchievementBadge from './AchievementBadge';

interface UnlockAnimationProps {
  achievement: UnlockedAchievement;
  onClose: () => void;
}

export default function UnlockAnimation({ achievement, onClose }: UnlockAnimationProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Set window size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    // Auto-close after 8 seconds
    const closeTimer = setTimeout(() => {
      onClose();
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Confetti */}
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
        )}

        {/* Achievement Card */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20
          }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Sparkles */}
          <div className="absolute -top-2 -left-2">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Content */}
          <div className="text-center">
            {/* Title */}
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2"
            >
              Achievement Unlocked!
            </motion.h2>

            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.4,
                type: 'spring',
                stiffness: 200,
                damping: 15
              }}
              className="flex justify-center my-6"
            >
              <AchievementBadge
                achievement={achievement}
                size="large"
                showProgress={false}
              />
            </motion.div>

            {/* Achievement Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {achievement.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {achievement.description}
              </p>

              {/* Rarity Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold text-sm">
                <span>{achievement.icon}</span>
                <span>{achievement.rarity.toUpperCase()} Achievement</span>
              </div>
            </motion.div>

            {/* Celebration Message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-sm text-gray-500 dark:text-gray-400"
            >
              🎉 Keep up the great work on your health journey!
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
