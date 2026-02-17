import { useState } from 'react';
import type { Budget, Transaction } from '../types';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '../types';

interface Props {
  budgets: Budget[];
  transactions: Transaction[];
  onAddBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => void;
  onDeleteBudget: (id: string) => void;
}

export default function Budgets({ budgets, transactions, onAddBudget, onDeleteBudget }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category && limit) {
      onAddBudget({ category, limit: parseFloat(limit), period });
      setCategory('');
      setLimit('');
      setShowAdd(false);
    }
  };

  const getCategorySpending = (cat: string, per: 'monthly' | 'yearly') => {
    const now = new Date();
    const filtered = transactions.filter(t => {
      if (t.type !== 'expense' || t.category !== cat) return false;
      const date = new Date(t.date);
      if (per === 'monthly') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      } else {
        return date.getFullYear() === now.getFullYear();
      }
    });
    return filtered.reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-manrope">Budgets</h2>
          <p className="text-gray-500 dark:text-gray-400">Track your spending limits</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-pro text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2"
        >
          <Plus size={20} />
          Add Budget
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="fin-card rounded-2xl p-6 space-y-4 fade-in-up">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 outline-none"
          >
            <option value="">Select Category</option>
            {CATEGORIES.expense.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="Budget Limit (₹)"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 outline-none"
          />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 outline-none"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 btn-pro text-white py-3 rounded-xl font-semibold">
              Create Budget
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 font-semibold">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {budgets.length === 0 ? (
          <div className="fin-card rounded-2xl p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <p className="text-gray-500">No budgets set. Create one to track spending!</p>
          </div>
        ) : (
          budgets.map(budget => {
            const spent = getCategorySpending(budget.category, budget.period);
            const percentage = (spent / budget.limit) * 100;
            const isOverBudget = spent > budget.limit;

            return (
              <div key={budget.id} className="fin-card rounded-2xl p-6 fade-in-up">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold font-manrope">{budget.category}</h3>
                    <p className="text-sm text-gray-500">{budget.period === 'monthly' ? 'Monthly' : 'Yearly'} Budget</p>
                  </div>
                  <button
                    onClick={() => onDeleteBudget(budget.id)}
                    className="text-gray-400 hover:text-red-500 smooth"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">₹{spent.toLocaleString('en-IN')} spent</span>
                    <span className="text-gray-500">of ₹{budget.limit.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full smooth ${isOverBudget ? 'expense-gradient' : 'money-gradient'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-semibold ${isOverBudget ? 'text-red-500' : 'text-green-600'}`}>
                      {isOverBudget ? `₹${(spent - budget.limit).toLocaleString('en-IN')} over!` : `₹${(budget.limit - spent).toLocaleString('en-IN')} remaining`}
                    </span>
                    <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
