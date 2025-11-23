/**
 * Achievement Tracker
 * Manages achievement progress and unlocking
 */

import { Achievement, ACHIEVEMENTS, UserAchievementData } from './definitions';
import { getHistory, getStatsSummary } from '../storage/history';

const STORAGE_KEY = 'aurelia_achievements';
const USER_DATA_KEY = 'aurelia_user_data';

export interface UnlockedAchievement extends Omit<Achievement, 'progress'> {
  isUnlocked: true;
  unlockedAt: Date;
  progress?: { current: number; max: number } | null;
}

/**
 * Get all unlocked achievements
 */
export const getUnlockedAchievements = (): UnlockedAchievement[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const unlocked = JSON.parse(stored);
    return unlocked.map((a: any) => ({
      ...a,
      unlockedAt: new Date(a.unlockedAt)
    }));
  } catch (error) {
    console.error('Error loading achievements:', error);
    return [];
  }
};

/**
 * Save unlocked achievements
 */
const saveUnlockedAchievements = (achievements: UnlockedAchievement[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
  } catch (error) {
    console.error('Error saving achievements:', error);
  }
};

/**
 * Get user achievement data
 */
export const getUserAchievementData = (): UserAchievementData => {
  if (typeof window === 'undefined') {
    return {
      totalAnalyses: 0,
      consecutiveDays: 0,
      goalsAchieved: 0,
      goalsSet: 0,
      healthScoreImprovement: 0,
      daysTracked: 0,
      pagesVisited: [],
      featuresUsed: [],
      latestHealthScore: 0,
      averageHealthScore: 0
    };
  }

  try {
    // Get stats from history
    const stats = getStatsSummary();
    const history = getHistory();
    
    // Get goals data
    const goalsStored = localStorage.getItem('aurelia_goals');
    const goals = goalsStored ? JSON.parse(goalsStored) : [];
    const goalsAchieved = goals.filter((g: any) => g.achieved).length;
    
    // Get user tracking data
    const userDataStored = localStorage.getItem(USER_DATA_KEY);
    const userData = userDataStored ? JSON.parse(userDataStored) : {
      pagesVisited: [],
      featuresUsed: []
    };
    
    // Calculate consecutive days
    const consecutiveDays = calculateConsecutiveDays(history);
    
    // Calculate health score improvement
    const improvement = calculateHealthScoreImprovement(history);
    
    return {
      totalAnalyses: stats.totalEntries,
      consecutiveDays,
      goalsAchieved,
      goalsSet: goals.length,
      healthScoreImprovement: improvement,
      daysTracked: stats.daysTracked,
      pagesVisited: userData.pagesVisited || [],
      featuresUsed: userData.featuresUsed || [],
      latestHealthScore: stats.latestScore,
      averageHealthScore: stats.averageScore
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    return {
      totalAnalyses: 0,
      consecutiveDays: 0,
      goalsAchieved: 0,
      goalsSet: 0,
      healthScoreImprovement: 0,
      daysTracked: 0,
      pagesVisited: [],
      featuresUsed: [],
      latestHealthScore: 0,
      averageHealthScore: 0
    };
  }
};

/**
 * Calculate consecutive days streak
 */
const calculateConsecutiveDays = (history: any[]): number => {
  if (history.length === 0) return 0;
  
  const sortedDates = history
    .map(entry => new Date(entry.timestamp).toDateString())
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 1;
  let currentDate = new Date(sortedDates[0]);
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i]);
    const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else if (diffDays > 1) {
      break;
    }
  }
  
  return streak;
};

/**
 * Calculate health score improvement
 */
const calculateHealthScoreImprovement = (history: any[]): number => {
  if (history.length < 2) return 0;
  
  const sorted = [...history].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const firstScore = sorted[0].mlRiskScore || 0;
  const latestScore = sorted[sorted.length - 1].mlRiskScore || 0;
  
  return Math.max(0, latestScore - firstScore);
};

/**
 * Track page visit
 */
export const trackPageVisit = (page: string) => {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(USER_DATA_KEY);
    const userData = stored ? JSON.parse(stored) : { pagesVisited: [], featuresUsed: [] };
    
    if (!userData.pagesVisited.includes(page)) {
      userData.pagesVisited.push(page);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    }
  } catch (error) {
    console.error('Error tracking page visit:', error);
  }
};

/**
 * Track feature usage
 */
export const trackFeatureUsage = (feature: string) => {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(USER_DATA_KEY);
    const userData = stored ? JSON.parse(stored) : { pagesVisited: [], featuresUsed: [] };
    
    if (!userData.featuresUsed.includes(feature)) {
      userData.featuresUsed.push(feature);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    }
  } catch (error) {
    console.error('Error tracking feature usage:', error);
  }
};

/**
 * Check for newly unlocked achievements
 */
export const checkAchievements = (): UnlockedAchievement[] => {
  const userData = getUserAchievementData();
  const unlocked = getUnlockedAchievements();
  const unlockedIds = new Set(unlocked.map(a => a.id));
  
  const newlyUnlocked: UnlockedAchievement[] = [];
  
  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (unlockedIds.has(achievement.id)) continue;
    
    // Check if condition is met
    if (achievement.condition(userData)) {
      const unlockedAchievement: UnlockedAchievement = {
        ...achievement,
        isUnlocked: true,
        unlockedAt: new Date(),
        progress: achievement.progress ? achievement.progress(userData) : null
      };
      newlyUnlocked.push(unlockedAchievement);
    }
  }
  
  // Save newly unlocked achievements
  if (newlyUnlocked.length > 0) {
    const allUnlocked = [...unlocked, ...newlyUnlocked];
    saveUnlockedAchievements(allUnlocked);
  }
  
  return newlyUnlocked;
};

/**
 * Get achievement progress
 */
export const getAchievementProgress = (achievementId: string): { current: number; max: number } | null => {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement || !achievement.progress) return null;
  
  const userData = getUserAchievementData();
  return achievement.progress(userData);
};

/**
 * Get all achievements with progress
 */
export const getAllAchievementsWithProgress = () => {
  const userData = getUserAchievementData();
  const unlocked = getUnlockedAchievements();
  const unlockedIds = new Set(unlocked.map(a => a.id));
  
  return ACHIEVEMENTS.map(achievement => {
    const isUnlocked = unlockedIds.has(achievement.id);
    const unlockedData = unlocked.find(a => a.id === achievement.id);
    const progress = achievement.progress ? achievement.progress(userData) : null;
    
    return {
      ...achievement,
      isUnlocked,
      unlockedAt: unlockedData?.unlockedAt,
      progress
    };
  });
};

/**
 * Get achievements by category
 */
export const getAchievementsByCategory = (category: Achievement['category']) => {
  return getAllAchievementsWithProgress().filter(a => a.category === category);
};

/**
 * Get achievements by rarity
 */
export const getAchievementsByRarity = (rarity: Achievement['rarity']) => {
  return getAllAchievementsWithProgress().filter(a => a.rarity === rarity);
};

/**
 * Get achievement statistics
 */
export const getAchievementStats = () => {
  const all = getAllAchievementsWithProgress();
  const unlocked = all.filter(a => a.isUnlocked);
  
  return {
    total: all.length,
    unlocked: unlocked.length,
    locked: all.length - unlocked.length,
    percentage: Math.round((unlocked.length / all.length) * 100),
    byRarity: {
      common: unlocked.filter(a => a.rarity === 'common').length,
      rare: unlocked.filter(a => a.rarity === 'rare').length,
      epic: unlocked.filter(a => a.rarity === 'epic').length,
      legendary: unlocked.filter(a => a.rarity === 'legendary').length
    },
    byCategory: {
      progress: unlocked.filter(a => a.category === 'progress').length,
      consistency: unlocked.filter(a => a.category === 'consistency').length,
      goals: unlocked.filter(a => a.category === 'goals').length,
      improvement: unlocked.filter(a => a.category === 'improvement').length,
      exploration: unlocked.filter(a => a.category === 'exploration').length
    }
  };
};
