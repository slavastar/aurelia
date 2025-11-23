'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, Check, X, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Goal {
  id: string;
  type: 'biomarker' | 'lifestyle' | 'custom';
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline?: Date;
  achieved: boolean;
  createdAt: Date;
}

export default function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    type: 'biomarker' as Goal['type'],
    title: '',
    target: 0,
    current: 0,
    unit: '',
    deadline: ''
  });

  useEffect(() => {
    // Load goals from localStorage
    const stored = localStorage.getItem('aurelia_goals');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setGoals(parsed.map((g: any) => ({
          ...g,
          createdAt: new Date(g.createdAt),
          deadline: g.deadline ? new Date(g.deadline) : undefined
        })));
      } catch (error) {
        console.error('Error loading goals:', error);
      }
    }
  }, []);

  const saveGoals = (updatedGoals: Goal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem('aurelia_goals', JSON.stringify(updatedGoals));
  };

  const addGoal = () => {
    if (!newGoal.title || !newGoal.target) return;

    const goal: Goal = {
      id: Date.now().toString(),
      type: newGoal.type,
      title: newGoal.title,
      target: newGoal.target,
      current: newGoal.current,
      unit: newGoal.unit,
      deadline: newGoal.deadline ? new Date(newGoal.deadline) : undefined,
      achieved: false,
      createdAt: new Date()
    };

    saveGoals([...goals, goal]);
    setNewGoal({
      type: 'biomarker',
      title: '',
      target: 0,
      current: 0,
      unit: '',
      deadline: ''
    });
    setShowAddGoal(false);
  };

  const updateGoalProgress = (id: string, current: number) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === id) {
        const achieved = current >= goal.target;
        return { ...goal, current, achieved };
      }
      return goal;
    });
    saveGoals(updatedGoals);
  };

  const deleteGoal = (id: string) => {
    saveGoals(goals.filter(g => g.id !== id));
  };

  const getProgress = (goal: Goal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getDaysRemaining = (deadline?: Date) => {
    if (!deadline) return null;
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-aurelia-lime" />
          <h2 className="text-xl font-bold text-white">
            Health Goals
          </h2>
        </div>
        <button
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="flex items-center gap-2 px-4 py-2 gradient-aurelia-lime text-aurelia-purple rounded-lg hover:opacity-90 transition text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {/* Add Goal Form */}
      {showAddGoal && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="font-semibold text-white mb-4">New Goal</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Goal Type
              </label>
              <select
                value={newGoal.type}
                onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as Goal['type'] })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:border-aurelia-lime"
              >
                <option value="biomarker" className="bg-aurelia-purple">Biomarker Target</option>
                <option value="lifestyle" className="bg-aurelia-purple">Lifestyle Change</option>
                <option value="custom" className="bg-aurelia-purple">Custom Goal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Goal Title
              </label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="e.g., Lower HbA1c to 5.5%"
                className="w-full px-3 py-2 border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:border-aurelia-lime placeholder-white/20"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Current
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newGoal.current}
                  onChange={(e) => setNewGoal({ ...newGoal, current: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:border-aurelia-lime"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Target
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:border-aurelia-lime"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                  placeholder="%"
                  className="w-full px-3 py-2 border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:border-aurelia-lime placeholder-white/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Deadline (Optional)
              </label>
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:border-aurelia-lime"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addGoal}
                className="flex-1 px-4 py-2 gradient-aurelia-lime text-aurelia-purple rounded-lg hover:opacity-90 transition font-semibold"
              >
                Add Goal
              </button>
              <button
                onClick={() => setShowAddGoal(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">No goals set yet</p>
          <p className="text-sm text-white/40 mt-1">
            Click "Add Goal" to start tracking your health objectives
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = getProgress(goal);
            const daysRemaining = getDaysRemaining(goal.deadline);

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-lg border transition ${
                  goal.achieved
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {goal.achieved && (
                        <Check className="w-5 h-5 text-green-400" />
                      )}
                      <h3 className="font-semibold text-white">
                        {goal.title}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-white/10 text-white/60 rounded-full">
                        {goal.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                      {daysRemaining !== null && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1 text-white/40 hover:text-red-400 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/60">Progress</span>
                    <span className="font-semibold text-white">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(progress)} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Update Progress */}
                {!goal.achieved && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={goal.current}
                      onChange={(e) => updateGoalProgress(goal.id, parseFloat(e.target.value))}
                      className="flex-1 px-3 py-1 text-sm border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:border-aurelia-lime"
                    />
                    <span className="text-sm text-white/60">{goal.unit}</span>
                    <TrendingUp className="w-4 h-4 text-aurelia-lime" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
