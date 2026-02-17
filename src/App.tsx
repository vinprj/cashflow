import { useState, useEffect, useMemo } from 'react';
import type { Transaction, Budget, Account, RecurringTransaction, ExportData } from './types';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';
import Budgets from './components/Budgets';
import Accounts from './components/Accounts';
import Reports from './components/Reports';
import RecurringTransactions from './components/RecurringTransactions';
import Header from './components/Header';

const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'income', amount: 85000, category: 'Salary', description: 'Monthly salary - February', date: '2026-02-01', createdAt: Date.now() },
  { id: '2', type: 'expense', amount: 28000, category: 'Rent', description: 'Monthly rent', date: '2026-02-01', createdAt: Date.now() },
  { id: '3', type: 'expense', amount: 4200, category: 'Food', description: 'Weekly groceries', date: '2026-02-05', createdAt: Date.now() },
  { id: '4', type: 'expense', amount: 1800, category: 'Transport', description: 'Metro pass', date: '2026-02-03', createdAt: Date.now() },
  { id: '5', type: 'expense', amount: 599, category: 'Entertainment', description: 'Netflix subscription', date: '2026-02-10', createdAt: Date.now() },
  { id: '6', type: 'income', amount: 15000, category: 'Freelance', description: 'Web project', date: '2026-02-12', createdAt: Date.now() },
];

const SAMPLE_ACCOUNTS: Account[] = [
  { id: '1', name: 'HDFC Checking', type: 'checking', balance: 85000, currency: 'INR', icon: '🏦', color: 'bg-gradient-to-br from-blue-600 to-blue-800', createdAt: Date.now() },
  { id: '2', name: 'Axis Savings', type: 'savings', balance: 150000, currency: 'INR', icon: '🐷', color: 'bg-gradient-to-br from-emerald-600 to-emerald-800', createdAt: Date.now() },
  { id: '3', name: 'Cash', type: 'cash', balance: 5000, currency: 'INR', icon: '💵', color: 'bg-gradient-to-br from-amber-500 to-amber-700', createdAt: Date.now() },
];

const SAMPLE_RECURRING: RecurringTransaction[] = [
  { id: 'r1', type: 'expense', amount: 28000, category: 'Rent', description: 'Monthly rent payment', frequency: 'monthly', startDate: '2026-01-01', accountId: '1', enabled: true, createdAt: Date.now() },
  { id: 'r2', type: 'expense', amount: 599, category: 'Entertainment', description: 'Netflix', frequency: 'monthly', startDate: '2026-01-01', accountId: '1', enabled: true, createdAt: Date.now() },
  { id: 'r3', type: 'income', amount: 85000, category: 'Salary', description: 'Salary', frequency: 'monthly', startDate: '2026-01-01', accountId: '1', enabled: true, createdAt: Date.now() },
];

function load<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch { return fallback; }
}

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => load('cf-transactions', SAMPLE_TRANSACTIONS));
  const [budgets, setBudgets] = useState<Budget[]>(() => load('cf-budgets', []));
  const [accounts, setAccounts] = useState<Account[]>(() => load('cf-accounts', SAMPLE_ACCOUNTS));
  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => load('cf-recurring', SAMPLE_RECURRING));
  const [view, setView] = useState<'dashboard' | 'transactions' | 'budgets' | 'accounts' | 'recurring' | 'reports'>('dashboard');
  const [showAdd, setShowAdd] = useState(false);
  const [dark, setDark] = useState(() => load('cf-dark', true));

  useEffect(() => { localStorage.setItem('cf-transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('cf-budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('cf-accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('cf-recurring', JSON.stringify(recurring)); }, [recurring]);
  useEffect(() => {
    localStorage.setItem('cf-dark', JSON.stringify(dark));
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const { totalIncome, totalExpense } = useMemo(() => {
    const inc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { totalIncome: inc, totalExpense: exp };
  }, [transactions]);

  const addTransaction = (t: Omit<Transaction, 'id' | 'createdAt'>) => {
    setTransactions(prev => [{ ...t, id: crypto.randomUUID(), createdAt: Date.now() }, ...prev]);
    setShowAdd(false);
  };

  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));

  const addBudget = (b: Omit<Budget, 'id' | 'createdAt'>) => {
    setBudgets(prev => [...prev, { ...b, id: crypto.randomUUID(), createdAt: Date.now() }]);
  };

  const deleteBudget = (id: string) => setBudgets(prev => prev.filter(b => b.id !== id));

  const addAccount = (a: Omit<Account, 'id' | 'createdAt'>) => {
    setAccounts(prev => [...prev, { ...a, id: crypto.randomUUID(), createdAt: Date.now() }]);
  };

  const deleteAccount = (id: string) => {
    setTransactions(prev => prev.map(t => t.accountId === id ? { ...t, accountId: undefined } : t));
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addRecurring = (r: Omit<RecurringTransaction, 'id' | 'createdAt'>) => {
    setRecurring(prev => [...prev, { ...r, id: crypto.randomUUID(), createdAt: Date.now() }]);
  };

  const deleteRecurring = (id: string) => setRecurring(prev => prev.filter(r => r.id !== id));

  const toggleRecurring = (id: string) => {
    setRecurring(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleImport = (data: ExportData) => {
    if (data.transactions) {
      setTransactions(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const newTxns = data.transactions.filter(t => !existingIds.has(t.id));
        return [...prev, ...newTxns];
      });
    }
    if (data.budgets) {
      setBudgets(prev => {
        const existingIds = new Set(prev.map(b => b.id));
        const newBudgets = data.budgets.filter(b => !existingIds.has(b.id));
        return [...prev, ...newBudgets];
      });
    }
    if (data.accounts) {
      setAccounts(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const newAccounts = data.accounts.filter(a => !existingIds.has(a.id));
        return [...prev, ...newAccounts];
      });
    }
    if (data.recurringTransactions) {
      setRecurring(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        const newRecurring = data.recurringTransactions.filter(r => !existingIds.has(r.id));
        return [...prev, ...newRecurring];
      });
    }
  };

  const accountBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    accounts.forEach(acc => { balances[acc.id] = acc.balance; });
    transactions.forEach(t => {
      if (t.accountId && balances[t.accountId] !== undefined) {
        balances[t.accountId] += t.type === 'income' ? t.amount : -t.amount;
      }
    });
    return balances;
  }, [accounts, transactions]);

  const totalNetWorth = Object.values(accountBalances).reduce((s, b) => s + b, 0);

  return (
    <div className="app-container">
      <Header 
        view={view} 
        setView={setView} 
        dark={dark} 
        setDark={setDark} 
        onAdd={() => setShowAdd(true)}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
      />
      
      <main className="main-content">
        {view === 'dashboard' && (
          <Dashboard 
            transactions={transactions} 
            totalIncome={totalIncome} 
            totalExpense={totalExpense}
            budgets={budgets}
            accounts={accounts}
            accountBalances={accountBalances}
            totalNetWorth={totalNetWorth}
          />
        )}
        {view === 'transactions' && (
          <TransactionList transactions={transactions} onDelete={deleteTransaction} accounts={accounts} />
        )}
        {view === 'budgets' && (
          <Budgets budgets={budgets} transactions={transactions} onAddBudget={addBudget} onDeleteBudget={deleteBudget} />
        )}
        {view === 'accounts' && (
          <Accounts accounts={accounts} accountBalances={accountBalances} onAddAccount={addAccount} onDeleteAccount={deleteAccount} />
        )}
        {view === 'recurring' && (
          <RecurringTransactions 
            recurring={recurring} 
            accounts={accounts} 
            onAdd={addRecurring}
            onDelete={deleteRecurring}
            onToggle={toggleRecurring}
          />
        )}
        {view === 'reports' && (
          <Reports transactions={transactions} accounts={accounts} budgets={budgets} onImport={handleImport} />
        )}
      </main>
      
      {showAdd && (
        <AddTransaction 
          onAdd={addTransaction} 
          onClose={() => setShowAdd(false)} 
          accounts={accounts} 
        />
      )}
    </div>
  );
}
