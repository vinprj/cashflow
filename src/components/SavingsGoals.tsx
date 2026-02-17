import { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Edit2, Check, X, PiggyBank, TrendingUp } from 'lucide-react';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
  icon: string;
}

const SAVINGS_KEY = 'cf-savings-goals'

const COLORS = [
  { bg: 'bg-emerald-500', text: 'text-emerald-500', gradient: 'from-emerald-500 to-teal-500' },
  { bg: 'bg-blue-500', text: 'text-blue-500', gradient: 'from-blue-500 to-cyan-500' },
  { bg: 'bg-purple-500', text: 'text-purple-500', gradient: 'from-purple-500 to-pink-500' },
  { bg: 'bg-orange-500', text: 'text-orange-500', gradient: 'from-orange-500 to-red-500' },
  { bg: 'bg-cyan-500', text: 'text-cyan-500', gradient: 'from-cyan-500 to-blue-500' },
]

const ICONS = ['🏖️', '🚗', '🏠', '💻', '🎓', '💍', '✈️', '🎮']

export default function SavingsGoals({ transactions }: { transactions: any[] }) {
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(SAVINGS_KEY)
    return saved ? JSON.parse(saved) : []
  })
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: '',
    colorIndex: 0,
    icon: '🏖️'
  })

  useEffect(() => {
    localStorage.setItem(SAVINGS_KEY, JSON.stringify(goals))
  }, [goals])

  // Calculate total savings from income - expenses
  const totalSavings = transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0) -
    transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  const addGoal = () => {
    if (!newGoal.name || newGoal.targetAmount <= 0) return
    
    const goal: SavingsGoal = {
      id: crypto.randomUUID(),
      name: newGoal.name,
      targetAmount: newGoal.targetAmount,
      currentAmount: newGoal.currentAmount,
      deadline: newGoal.deadline,
      color: COLORS[newGoal.colorIndex].gradient,
      icon: newGoal.icon
    }
    
    setGoals(prev => [...prev, goal])
    setShowAdd(false)
    setNewGoal({
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: '',
      colorIndex: 0,
      icon: '🏖️'
    })
  }

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const updateProgress = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
    ))
  }

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const totalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0)
  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0

  return (
    <div className="mt-6 space-y-6">
      {/* Summary Card */}
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <PiggyBank className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Savings Goals</h2>
              <p className="text-sm text-gray-500">Track your financial targets</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
          >
            <Plus size={18} /> Add Goal
          </button>
        </div>

        {/* Overall Progress */}
        {goals.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Total Progress</span>
              <span className="font-semibold">₹{totalCurrent.toLocaleString('en-IN')} / ₹{totalTarget.toLocaleString('en-IN')}</span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
              <Target className="text-emerald-500" size={40} />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Savings Goals Yet</h3>
            <p className="text-gray-500 mb-4">Start saving for your dreams!</p>
            <button
              onClick={() => setShowAdd(true)}
              className="text-emerald-500 font-medium hover:underline"
            >
              Create your first goal →
            </button>
          </div>
        ) : (
          /* Goals Grid */
          <div className="grid gap-4 md:grid-cols-2">
            {goals.map(goal => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
              const daysLeft = goal.deadline ? Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null
              const color = COLORS.find(c => c.gradient === goal.color) || COLORS[0]
              
              return (
                <div 
                  key={goal.id}
                  className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center text-2xl`}>
                        {goal.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{goal.name}</h3>
                        {daysLeft !== null && (
                          <p className="text-xs text-gray-500">
                            {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">₹{goal.currentAmount.toLocaleString('en-IN')}</span>
                      <span className="font-semibold">₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${goal.color} transition-all duration-1000`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Progress % */}
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold bg-gradient-to-r ${goal.color} bg-clip-text text-transparent`}>
                      {progress.toFixed(0)}%
                    </span>
                    {progress >= 100 && (
                      <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                        🎉 Goal Reached!
                      </span>
                    )}
                  </div>

                  {/* Quick Add */}
                  {progress < 100 && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex gap-2">
                        {[1000, 5000, 10000].map(amount => (
                          <button
                            key={amount}
                            onClick={() => updateProgress(goal.id, amount)}
                            className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 transition-colors"
                          >
                            +₹{amount.toLocaleString('en-IN')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative w-full max-w-md p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">New Savings Goal</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Name</label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={e => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Vacation to Japan"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Amount (₹)</label>
                <input
                  type="number"
                  value={newGoal.targetAmount || ''}
                  onChange={e => setNewGoal(prev => ({ ...prev, targetAmount: parseInt(e.target.value) || 0 }))}
                  placeholder="50000"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Current Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Savings (₹)</label>
                <input
                  type="number"
                  value={newGoal.currentAmount || ''}
                  onChange={e => setNewGoal(prev => ({ ...prev, currentAmount: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date (optional)</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={e => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewGoal(prev => ({ ...prev, icon }))}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                        newGoal.icon === icon 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-500' 
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Theme</label>
                <div className="flex gap-2">
                  {COLORS.map((color, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewGoal(prev => ({ ...prev, colorIndex: i }))}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${color.gradient} transition-all ${
                        newGoal.colorIndex === i ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addGoal}
                disabled={!newGoal.name || newGoal.targetAmount <= 0}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
