import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import type { Transaction } from '../types';
import { CATEGORY_ICONS } from '../types';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6b7280'];

interface Props { transactions: Transaction[]; balance: number; totalIncome: number; totalExpense: number; }

export default function Dashboard({ transactions, balance, totalIncome, totalExpense }: Props) {
  const expenseByCategory = Object.entries(
    transactions.filter(t => t.type === 'expense').reduce((acc, t) => ({ ...acc, [t.category]: (acc[t.category] || 0) + t.amount }), {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 text-gray-500 mb-2"><Wallet size={18} /> Balance</div>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmt(balance)}</p>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 text-gray-500 mb-2"><TrendingUp size={18} /> Income</div>
          <p className="text-2xl font-bold text-emerald-600">{fmt(totalIncome)}</p>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 text-gray-500 mb-2"><TrendingDown size={18} /> Expenses</div>
          <p className="text-2xl font-bold text-red-500">{fmt(totalExpense)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Spending by Category</h3>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v as number)} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-12">No expenses yet</p>}
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Top Expenses</h3>
          <div className="space-y-3">
            {expenseByCategory.slice(0, 5).map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-lg">{CATEGORY_ICONS[c.name] || '📌'}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm"><span>{c.name}</span><span className="font-medium">{fmt(c.value)}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(c.value / expenseByCategory[0].value) * 100}%`, backgroundColor: COLORS[i] }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
