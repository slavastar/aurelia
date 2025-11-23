/**
 * Historical Data Storage
 * Manages saving and retrieving historical health data in localStorage
 */

import { Biomarkers, QuestionnaireData } from '@/types';

export interface HistoricalEntry {
  id: string;
  timestamp: number;
  date: string;
  biomarkers: Biomarkers;
  questionnaire: QuestionnaireData;
  analysis: {
    mlRiskScore: number;
    mlConfidence: number;
    riskFactors: string[];
    aureliaAnalysis: string;
  };
}

const STORAGE_KEY = 'aurelia_history';
const MAX_ENTRIES = 50; // Keep last 50 entries

/**
 * Save a new historical entry
 */
export function saveHistoricalEntry(
  biomarkers: Biomarkers,
  questionnaire: QuestionnaireData,
  analysis: {
    mlRiskScore: number;
    mlConfidence: number;
    riskFactors: string[];
    aureliaAnalysis: string;
  }
): void {
  try {
    const entry: HistoricalEntry = {
      id: generateId(),
      timestamp: Date.now(),
      date: new Date().toISOString(),
      biomarkers,
      questionnaire,
      analysis,
    };

    const history = getHistory();
    history.unshift(entry); // Add to beginning

    // Keep only MAX_ENTRIES
    if (history.length > MAX_ENTRIES) {
      history.splice(MAX_ENTRIES);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving historical entry:', error);
  }
}

/**
 * Get all historical entries
 */
export function getHistory(): HistoricalEntry[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
}

/**
 * Get a specific historical entry by ID
 */
export function getHistoricalEntry(id: string): HistoricalEntry | null {
  const history = getHistory();
  return history.find(entry => entry.id === id) || null;
}

/**
 * Get the most recent entry
 */
export function getLatestEntry(): HistoricalEntry | null {
  const history = getHistory();
  return history[0] || null;
}

/**
 * Get entries within a date range
 */
export function getEntriesByDateRange(startDate: Date, endDate: Date): HistoricalEntry[] {
  const history = getHistory();
  return history.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });
}

/**
 * Get trend data for a specific biomarker
 */
export function getBiomarkerTrend(biomarkerName: string, limit: number = 10): Array<{
  date: string;
  value: number;
  timestamp: number;
}> {
  const history = getHistory();
  return history
    .slice(0, limit)
    .filter(entry => entry.biomarkers[biomarkerName] !== undefined)
    .map(entry => ({
      date: entry.date,
      value: entry.biomarkers[biomarkerName] as number,
      timestamp: entry.timestamp,
    }))
    .reverse(); // Oldest first for chart display
}

/**
 * Get health score trend
 */
export function getHealthScoreTrend(limit: number = 10): Array<{
  date: string;
  score: number;
  timestamp: number;
}> {
  const history = getHistory();
  return history
    .slice(0, limit)
    .map(entry => ({
      date: entry.date,
      score: entry.analysis.mlRiskScore,
      timestamp: entry.timestamp,
    }))
    .reverse(); // Oldest first for chart display
}

/**
 * Calculate average health score
 */
export function getAverageHealthScore(limit: number = 10): number {
  const trend = getHealthScoreTrend(limit);
  if (trend.length === 0) return 0;
  const sum = trend.reduce((acc, entry) => acc + entry.score, 0);
  return Math.round(sum / trend.length);
}

/**
 * Get improvement percentage (comparing latest to average)
 */
export function getImprovementPercentage(): number {
  const latest = getLatestEntry();
  if (!latest) return 0;

  const history = getHistory();
  if (history.length < 2) return 0;

  const previous = history[1];
  const change = latest.analysis.mlRiskScore - previous.analysis.mlRiskScore;
  const percentage = (change / previous.analysis.mlRiskScore) * 100;
  
  return Math.round(percentage * 10) / 10; // Round to 1 decimal
}

/**
 * Get most common risk factors
 */
export function getCommonRiskFactors(limit: number = 5): Array<{
  factor: string;
  count: number;
  percentage: number;
}> {
  const history = getHistory();
  if (history.length === 0) return [];

  const factorCounts: Record<string, number> = {};
  
  history.forEach(entry => {
    entry.analysis.riskFactors.forEach(factor => {
      factorCounts[factor] = (factorCounts[factor] || 0) + 1;
    });
  });

  const total = history.length;
  const factors = Object.entries(factorCounts)
    .map(([factor, count]) => ({
      factor,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return factors;
}

/**
 * Delete a historical entry
 */
export function deleteHistoricalEntry(id: string): void {
  try {
    const history = getHistory();
    const filtered = history.filter(entry => entry.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting entry:', error);
  }
}

/**
 * Clear all historical data
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

/**
 * Export history as JSON
 */
export function exportHistory(): string {
  const history = getHistory();
  return JSON.stringify(history, null, 2);
}

/**
 * Import history from JSON
 */
export function importHistory(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    if (!Array.isArray(data)) return false;
    
    // Validate data structure
    const isValid = data.every(entry => 
      entry.id && 
      entry.timestamp && 
      entry.biomarkers && 
      entry.analysis
    );
    
    if (!isValid) return false;
    
    localStorage.setItem(STORAGE_KEY, jsonData);
    return true;
  } catch (error) {
    console.error('Error importing history:', error);
    return false;
  }
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get statistics summary
 */
export function getStatsSummary() {
  const history = getHistory();
  const latest = getLatestEntry();
  
  if (!latest) {
    return {
      totalEntries: 0,
      latestScore: 0,
      averageScore: 0,
      improvement: 0,
      daysTracked: 0,
    };
  }

  const scores = history.map(e => e.analysis.mlRiskScore);
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  const oldestEntry = history[history.length - 1];
  const daysTracked = Math.floor(
    (latest.timestamp - oldestEntry.timestamp) / (1000 * 60 * 60 * 24)
  );

  return {
    totalEntries: history.length,
    latestScore: latest.analysis.mlRiskScore,
    averageScore: Math.round(averageScore),
    improvement: getImprovementPercentage(),
    daysTracked: Math.max(daysTracked, 0),
  };
}
