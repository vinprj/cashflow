import { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Transaction } from '../types';
import { CATEGORY_ICONS } from '../types';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6b7280'];

interface Props { transactions: Transaction[]; balance: number; totalIncome: number; totalExpense: number; }

// Animated Counter Component
function AnimatedCounter({ value, prefix = '₹', duration = 1000 }: { value: number; prefix?: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);
  
  useEffect(() => {
    const startValue = prevValue.current;
    const endValue = value;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * eased);
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValue.current = endValue;
      }
    };
    
    animate();
  }, [value, duration]);
  
  return <span>{prefix}{displayValue.toLocaleString('en-IN')}</span>;
}

// Trend Indicator Component
function TrendIndicator({ current, previous }: { current: number; previous: number }) {
  const [animate, setAnimate] = useState(false);
  const diff = current - previous;
  const percentChange = previous > 0 ? ((diff / previous) * 100).toFixed(1) : 0;
  const isPositive = diff > 0;
  
  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 600);
    return () => clearTimeout(timer);
  }, [current]);
  
  if (previous === 0) return null;
  
  return (
    <div className={`flex items-center gap-1 text-xs font-medium transition-all duration-300 ${animate ? 'scale-110' : 'scale-100'} ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
      {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      <span>{Math.abs(Number(percentChange))}%</span>
    </div>
  );
}

export default function Dashboard({ transactions, balance, totalIncome, totalExpense }: Props) {
  const expenseByCategory = Object.entries(
    transactions.filter(t => t.type === 'expense').reduce((acc, t) => ({ ...acc, [t.category]: (acc[t.category] || 0) + t.amount }), {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Monthly trend data (last 6 months)
  const monthlyData = transactions.reduce((acc, t) => {
    const month = t.date.substring(0, 7);
    if (!acc[month]) acc[month] = { month, income: 0, expense: 0 };
    if (t.type === 'income') acc[month].income += t.amount;
    else acc[month].expense += t.amount;
    return acc;
  }, {} as Record<string, { month: string; income: number; expense: number }>);
  
  const trendData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)
    .map(d => ({
      ...d,
      month: new Date(d.month + '-01').toLocaleString('en-IN', { month: 'short' })
    }));

  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

  // Previous month totals for comparison
  const currentMonth = new Date().toISOString().slice(0, 7);
  const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
  
  const currentMonthTxns = transactions.filter(t => t.date.startsWith(currentMonth));
  const prevMonthTxns = transactions.filter(t => t.date.startsWith(prevMonth));
  
  const currentIncome = currentMonthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const prevIncome = prevMonthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const currentExpense = currentMonthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevMonthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`mt-6 space-y-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="group p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-gray-500"><Wallet size={18} /> Balance</div>
            <div className={`w-2 h-2 rounded-full ${balance >= 0 ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
          </div>
          <p className={`text-2xl font-bold transition-all duration-300 ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            <AnimatedCounter value={balance} />
          </p>
        </div>
        
        <div className="group p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-gray-500"><TrendingUp size={18} /> Income</div>
            <TrendIndicator current={currentIncome} previous={prevIncome} />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 transition-all duration-300">
            <AnimatedCounter value={totalIncome} />
          </p>
        </div>
        
        <div className="group p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-gray-500"><TrendingDown size={18} /> Expenses</div>
            <TrendIndicator current={currentExpense} previous={prevExpense} />
          </div>
          <p className="text-2xl font-bold text-red-500 dark:text-red-400 transition-all duration-300">
            <AnimatedCounter value={totalExpense} />
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Spending by Category</h3>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie 
                  data={expenseByCategory} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={100} 
                  dataKey="value"
                  animationDuration={800}
                  animationBegin={0}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {expenseByCategory.map((_, i) => (
                    <Cell 
                      key={i} 
                      fill={COLORS[i % COLORS.length]} 
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(v) => fmt(v as number)}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-12">No expenses yet</p>}
        </div>

        {/* Top Expenses */}
        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Top Expenses</h3>
          <div className="space-y-3">
            {expenseByCategory.slice(0, 5).map((c, i) => (
              <div 
                key={c.name} 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-default"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-lg transform transition-transform hover:scale-110">{CATEGORY_ICONS[c.name] || '📌'}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm"><span>{c.name}</span><span className="font-medium">{fmt(c.value)}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ 
                        width: `${(c.value / expenseByCategory[0].value) * 100}%`, 
                        backgroundColor: COLORS[i],
                        animation: 'growWidth 1s ease-out forwards'
                      }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      {trendData.length > 0 && (
        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(v: number) => fmt(v)}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={1000} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <style>{`
        @keyframes growWidth {
          from { width: 0%; }
          to { width: var(--target-width, 100%); }
        }
      `}</style>
    </div>
  );
}
