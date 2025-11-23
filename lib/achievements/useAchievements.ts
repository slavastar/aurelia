'use client';

import { useState, useEffect, useCallback } from 'react';
import { checkAchievements, UnlockedAchievement } from './tracker';

/**
 * Custom hook for achievement tracking
 * Automatically checks for newly unlocked achievements
 */
export function useAchievements() {
  const [newlyUnlocked, setNewlyUnlocked] = useState<UnlockedAchievement[]>([]);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [currentUnlock, setCurrentUnlock] = useState<UnlockedAchievement | null>(null);

  const checkForNewAchievements = useCallback(() => {
    const unlocked = checkAchievements();
    
    if (unlocked.length > 0) {
      setNewlyUnlocked(unlocked);
      // Show first achievement
      setCurrentUnlock(unlocked[0]);
      setShowUnlockAnimation(true);
    }
  }, []);

  const handleCloseAnimation = useCallback(() => {
    setShowUnlockAnimation(false);
    
    // If there are more achievements, show the next one after a delay
    setTimeout(() => {
      const currentIndex = newlyUnlocked.findIndex(a => a.id === currentUnlock?.id);
      if (currentIndex < newlyUnlocked.length - 1) {
        setCurrentUnlock(newlyUnlocked[currentIndex + 1]);
        setShowUnlockAnimation(true);
      } else {
        setCurrentUnlock(null);
        setNewlyUnlocked([]);
      }
    }, 500);
  }, [newlyUnlocked, currentUnlock]);

  return {
    checkForNewAchievements,
    showUnlockAnimation,
    currentUnlock,
    handleCloseAnimation,
    hasNewAchievements: newlyUnlocked.length > 0
  };
}
