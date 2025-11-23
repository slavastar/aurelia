/**
 * Achievement System Definitions
 * Defines all available achievements and their unlock conditions
 */

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  category: 'progress' | 'consistency' | 'goals' | 'improvement' | 'exploration';
  condition: (userData: UserAchievementData) => boolean;
  progress?: (userData: UserAchievementData) => { current: number; max: number };
  unlockedAt?: Date;
}

export type DisplayAchievement = Omit<Achievement, 'progress'> & {
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress?: { current: number; max: number } | null;
};

export interface UserAchievementData {
  totalAnalyses: number;
  consecutiveDays: number;
  goalsAchieved: number;
  goalsSet: number;
  healthScoreImprovement: number;
  daysTracked: number;
  pagesVisited: string[];
  featuresUsed: string[];
  latestHealthScore: number;
  averageHealthScore: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Progress Achievements
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first health analysis',
    icon: '🎯',
    rarity: 'common',
    category: 'progress',
    condition: (data) => data.totalAnalyses >= 1,
    progress: (data) => ({ current: Math.min(data.totalAnalyses, 1), max: 1 })
  },
  {
    id: 'data_enthusiast',
    title: 'Data Enthusiast',
    description: 'Complete 10 health analyses',
    icon: '📊',
    rarity: 'rare',
    category: 'progress',
    condition: (data) => data.totalAnalyses >= 10,
    progress: (data) => ({ current: Math.min(data.totalAnalyses, 10), max: 10 })
  },
  {
    id: 'health_scholar',
    title: 'Health Scholar',
    description: 'Complete 25 health analyses',
    icon: '🎓',
    rarity: 'epic',
    category: 'progress',
    condition: (data) => data.totalAnalyses >= 25,
    progress: (data) => ({ current: Math.min(data.totalAnalyses, 25), max: 25 })
  },
  {
    id: 'longevity_master',
    title: 'Longevity Master',
    description: 'Complete 50 health analyses',
    icon: '👑',
    rarity: 'legendary',
    category: 'progress',
    condition: (data) => data.totalAnalyses >= 50,
    progress: (data) => ({ current: Math.min(data.totalAnalyses, 50), max: 50 })
  },

  // Consistency Achievements
  {
    id: 'consistent_tracker',
    title: 'Consistent Tracker',
    description: 'Track your health for 7 consecutive days',
    icon: '🔥',
    rarity: 'common',
    category: 'consistency',
    condition: (data) => data.consecutiveDays >= 7,
    progress: (data) => ({ current: Math.min(data.consecutiveDays, 7), max: 7 })
  },
  {
    id: 'dedicated_monitor',
    title: 'Dedicated Monitor',
    description: 'Track your health for 30 consecutive days',
    icon: '⚡',
    rarity: 'rare',
    category: 'consistency',
    condition: (data) => data.consecutiveDays >= 30,
    progress: (data) => ({ current: Math.min(data.consecutiveDays, 30), max: 30 })
  },
  {
    id: 'health_champion',
    title: 'Health Champion',
    description: 'Track your health for 90 consecutive days',
    icon: '🏆',
    rarity: 'epic',
    category: 'consistency',
    condition: (data) => data.consecutiveDays >= 90,
    progress: (data) => ({ current: Math.min(data.consecutiveDays, 90), max: 90 })
  },
  {
    id: 'wellness_legend',
    title: 'Wellness Legend',
    description: 'Track your health for 365 consecutive days',
    icon: '🌟',
    rarity: 'legendary',
    category: 'consistency',
    condition: (data) => data.consecutiveDays >= 365,
    progress: (data) => ({ current: Math.min(data.consecutiveDays, 365), max: 365 })
  },

  // Goal Achievements
  {
    id: 'goal_setter',
    title: 'Goal Setter',
    description: 'Set your first health goal',
    icon: '🎯',
    rarity: 'common',
    category: 'goals',
    condition: (data) => data.goalsSet >= 1,
    progress: (data) => ({ current: Math.min(data.goalsSet, 1), max: 1 })
  },
  {
    id: 'goal_getter',
    title: 'Goal Getter',
    description: 'Achieve your first health goal',
    icon: '✅',
    rarity: 'rare',
    category: 'goals',
    condition: (data) => data.goalsAchieved >= 1,
    progress: (data) => ({ current: Math.min(data.goalsAchieved, 1), max: 1 })
  },
  {
    id: 'goal_crusher',
    title: 'Goal Crusher',
    description: 'Achieve 3 health goals',
    icon: '💪',
    rarity: 'epic',
    category: 'goals',
    condition: (data) => data.goalsAchieved >= 3,
    progress: (data) => ({ current: Math.min(data.goalsAchieved, 3), max: 3 })
  },
  {
    id: 'goal_master',
    title: 'Goal Master',
    description: 'Achieve 10 health goals',
    icon: '🎖️',
    rarity: 'legendary',
    category: 'goals',
    condition: (data) => data.goalsAchieved >= 10,
    progress: (data) => ({ current: Math.min(data.goalsAchieved, 10), max: 10 })
  },

  // Improvement Achievements
  {
    id: 'optimizer',
    title: 'Optimizer',
    description: 'Improve your health score by 10 points',
    icon: '📈',
    rarity: 'rare',
    category: 'improvement',
    condition: (data) => data.healthScoreImprovement >= 10,
    progress: (data) => ({ current: Math.min(data.healthScoreImprovement, 10), max: 10 })
  },
  {
    id: 'transformer',
    title: 'Transformer',
    description: 'Improve your health score by 20 points',
    icon: '🚀',
    rarity: 'epic',
    category: 'improvement',
    condition: (data) => data.healthScoreImprovement >= 20,
    progress: (data) => ({ current: Math.min(data.healthScoreImprovement, 20), max: 20 })
  },
  {
    id: 'peak_performer',
    title: 'Peak Performer',
    description: 'Achieve a health score of 90 or higher',
    icon: '⭐',
    rarity: 'legendary',
    category: 'improvement',
    condition: (data) => data.latestHealthScore >= 90,
    progress: (data) => ({ current: Math.min(data.latestHealthScore, 90), max: 90 })
  },

  // Exploration Achievements
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Visit all main sections of AUREL✦A',
    icon: '🗺️',
    rarity: 'common',
    category: 'exploration',
    condition: (data) => {
      const requiredPages = ['dashboard', 'analytics', 'recommendations', 'results'];
      return requiredPages.every(page => data.pagesVisited.includes(page));
    },
    progress: (data) => {
      const requiredPages = ['dashboard', 'analytics', 'recommendations', 'results'];
      const visited = requiredPages.filter(page => data.pagesVisited.includes(page)).length;
      return { current: visited, max: requiredPages.length };
    }
  },
  {
    id: 'power_user',
    title: 'Power User',
    description: 'Use all major features (goals, export, dark mode)',
    icon: '⚙️',
    rarity: 'rare',
    category: 'exploration',
    condition: (data) => {
      const requiredFeatures = ['goals', 'export', 'dark_mode'];
      return requiredFeatures.every(feature => data.featuresUsed.includes(feature));
    },
    progress: (data) => {
      const requiredFeatures = ['goals', 'export', 'dark_mode'];
      const used = requiredFeatures.filter(feature => data.featuresUsed.includes(feature)).length;
      return { current: used, max: requiredFeatures.length };
    }
  },
];

export const getRarityColor = (rarity: AchievementRarity): string => {
  const colors = {
    common: 'from-gray-400 to-gray-500',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  };
  return colors[rarity];
};

export const getRarityTextColor = (rarity: AchievementRarity): string => {
  const colors = {
    common: 'text-gray-600 dark:text-gray-400',
    rare: 'text-blue-600 dark:text-blue-400',
    epic: 'text-purple-600 dark:text-purple-400',
    legendary: 'text-yellow-600 dark:text-yellow-400'
  };
  return colors[rarity];
};

export const getRarityBgColor = (rarity: AchievementRarity): string => {
  const colors = {
    common: 'bg-gray-100 dark:bg-gray-800',
    rare: 'bg-blue-100 dark:bg-blue-900/20',
    epic: 'bg-purple-100 dark:bg-purple-900/20',
    legendary: 'bg-yellow-100 dark:bg-yellow-900/20'
  };
  return colors[rarity];
};
