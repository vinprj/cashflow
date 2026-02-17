import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Transaction, Budget, Account } from '../types';
import { CATEGORY_ICONS } from '../types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16'];

interface Props { 
  transactions: Transaction[]; 
  totalIncome: number; 
  totalExpense: number;
  budgets?: Budget[];
  accounts?: Account[];
  accountBalances?: Record<string, number>;
  totalNetWorth?: number;
}

export default function Dashboard({ 
  transactions, 
  totalIncome, 
  totalExpense, 
  budgets = [],
  accounts = [],
  accountBalances = {},
  totalNetWorth = 0
}: Props) {
  const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const monthlyExpenses = useMemo(() => {
    return transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));
  }, [transactions, currentMonth]);

  const expenseByCategory = useMemo(() => {
    return Object.entries(
      monthlyExpenses.reduce((acc, t) => ({ ...acc, [t.category]: (acc[t.category] || 0) + t.amount }), {} as Record<string, number>)
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthlyExpenses]);

  const budgetAlerts = useMemo(() => {
    return budgets.map(budget => {
      const spent = expenseByCategory.find(c => c.name === budget.category)?.value || 0;
      const percent = (spent / budget.limit) * 100;
      return { ...budget, spent, percent, exceeded: percent > 100 };
    }).filter(b => b.percent > 80);
  }, [budgets, expenseByCategory]);

  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayExpenses = transactions
        .filter(t => t.date === dateStr && t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
      const dayIncome = transactions
        .filter(t => t.date === dateStr && t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);
      data.push({ day: days[d.getDay()], income: dayIncome, expenses: dayExpenses });
    }
    return data;
  }, [transactions]);

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;

  const tooltipFormatter = (val: number | undefined) => val !== undefined ? formatINR(val) : '₹0';

  return (
    <div className="animate-fade-in">
      {budgetAlerts.length > 0 && (
        <div className="alert-banner mb-6">
          <div className="alert-icon"><AlertTriangle size={18} /></div>
          <div className="alert-content">
            <div className="alert-title">Budget Alert</div>
            <div className="alert-text">
              {budgetAlerts.map(b => (
                <span key={b.id}>{b.category}: {b.percent.toFixed(0)}% used{b.exceeded && ' - Over!'}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid-4 mb-6 stagger-children">
        <div className="stat-card">
          <div className="stat-label flex items-center gap-2"><Wallet size={16} /> Net Worth</div>
          <div className="stat-value balance">{formatINR(totalNetWorth)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label flex items-center gap-2"><TrendingUp size={16} /> Income</div>
          <div className="stat-value income">{formatINR(totalIncome)}</div>
          <div className="stat-change positive"><ArrowUpRight size={14} />This month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label flex items-center gap-2"><TrendingDown size={16} /> Expenses</div>
          <div className="stat-value expense">{formatINR(totalExpense)}</div>
          <div className="stat-change negative"><ArrowDownRight size={14} />This month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label flex items-center gap-2"><Target size={16} /> Savings Rate</div>
          <div className={`stat-value ${savingsRate >= 0 ? 'income' : 'expense'}`}>{savingsRate.toFixed(1)}%</div>
          <div className="stat-change neutral">{savingsRate >= 20 ? '🎯 Great!' : savingsRate >= 0 ? '👍 Good' : '⚠️'}</div>
        </div>
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-header"><h3 className="card-title">Expenses by Category</h3></div>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={2}>
                  {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={tooltipFormatter} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No expenses this month</p></div>}
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Weekly Activity</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} tickLine={false} axisLine={false} />
              <Tooltip formatter={tooltipFormatter} />
              <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3 className="card-title">Top Expenses</h3></div>
          <div className="category-list">
            {expenseByCategory.slice(0, 6).map((c, i) => (
              <div key={c.name} className="category-item">
                <div className="category-icon">{CATEGORY_ICONS[c.name] || '📌'}</div>
                <div className="category-info">
                  <div className="category-name">{c.name}</div>
                  <div className="category-bar">
                    <div className="category-fill" style={{ width: `${(c.value / expenseByCategory[0].value) * 100}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
                <div className="category-amount">{formatINR(c.value)}</div>
              </div>
            ))}
            {expenseByCategory.length === 0 && <div className="empty-state"><p>No expenses</p></div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Recent Transactions</h3></div>
          <div className="transaction-list">
            {recentTransactions.map(t => (
              <div key={t.id} className="transaction-row">
                <div className="transaction-icon">{CATEGORY_ICONS[t.category] || '📌'}</div>
                <div className="transaction-details">
                  <div className="transaction-desc">{t.description || t.category}</div>
                  <div className="transaction-meta"><span>{t.date}</span></div>
                </div>
                <div className={`transaction-amount ${t.type}`}>{t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {accounts.length > 0 && (
        <div className="mt-6">
          <div className="card-header mb-4"><h3 className="card-title">Accounts</h3></div>
          <div className="grid-3">
            {accounts.map(acc => (
              <div key={acc.id} className="account-card">
                <div className={`account-icon ${acc.color}`}>{acc.icon}</div>
                <div className="account-details">
                  <div className="account-name">{acc.name}</div>
                  <div className="account-type">{acc.type}</div>
                </div>
                <div className="account-balance">{formatINR(accountBalances[acc.id] ?? acc.balance)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
