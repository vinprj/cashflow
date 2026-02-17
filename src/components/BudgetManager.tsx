import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import type { Budget, Transaction } from '../types';
import { CATEGORIES, CATEGORY_ICONS } from '../types';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

interface Props {
  budgets: Budget[];
  transactions: Transaction[];
  onAdd: (budget: Omit<Budget, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

export default function BudgetManager({ budgets, transactions, onAdd, onDelete }: Props) {
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));
  
  const getSpent = (cat: string) => 
    monthlyExpenses.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0);

  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

  const handleAdd = () => {
    if (!limit || Number(limit) <= 0) return;
    onAdd({ category, limit: Number(limit), period });
    setLimit('');
  };

  const budgetData = budgets.map(b => ({
    name: b.category,
    value: getSpent(b.category),
    limit: b.limit
  }));

  return (
    <div className="mt-6 space-y-6">
      {/* Add Budget Form */}
      <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Set Budget</h3>
        <div className="flex gap-3 flex-wrap">
          <select value={category} onChange={e => setCategory(e.target.value)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            {CATEGORIES.expense.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
          </select>
          <input type="number" placeholder="Limit amount" value={limit} onChange={e => setLimit(e.target.value)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-40" />
          <select value={period} onChange={e => setPeriod(e.target.value as 'monthly' | 'yearly')} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-violet-600 text-white flex items-center gap-2 hover:bg-violet-700">
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      {/* Budget List */}
      <div className="grid gap-4">
        {budgets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No budgets set yet</div>
        ) : budgets.map(budget => {
          const spent = getSpent(budget.category);
          const percent = Math.min((spent / budget.limit) * 100, 100);
          const isOver = spent > budget.limit;
          
          return (
            <div key={budget.id} className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CATEGORY_ICONS[budget.category] || '📌'}</span>
                  <div>
                    <h4 className="font-semibold">{budget.category}</h4>
                    <p className="text-sm text-gray-500">{budget.period}</p>
                  </div>
                </div>
                <button onClick={() => onDelete(budget.id)} className="p-2 text-gray-400 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="relative h-4 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div 
                  className={`absolute h-full rounded-full transition-all ${isOver ? 'bg-red-500' : 'bg-violet-500'}`} 
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className={isOver ? 'text-red-500' : 'text-gray-500'}>
                  {fmt(spent)} spent
                </span>
                <span className="text-gray-500">{fmt(budget.limit)} limit</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Budget Overview Chart */}
      {budgets.length > 0 && (
        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
            <TrendingUp size={18} /> Budget Overview
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie 
                data={budgetData} 
                cx="50%" 
                cy="50%" 
                innerRadius={50} 
                outerRadius={80} 
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {budgetData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
