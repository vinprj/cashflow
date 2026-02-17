import { useState, useEffect } from 'react';
import type { Transaction, Budget, Account, ExportData } from './types';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';
import Budgets from './components/Budgets';
import Accounts from './components/Accounts';
import Export from './components/Export';
import Header from './components/Header';
import SavingsGoals from './components/SavingsGoals';

const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'income', amount: 50000, category: 'Salary', description: 'Monthly salary', date: '2026-02-01', createdAt: Date.now() },
  { id: '2', type: 'expense', amount: 12000, category: 'Rent', description: 'Monthly rent', date: '2026-02-02', createdAt: Date.now() },
  { id: '3', type: 'expense', amount: 3500, category: 'Food', description: 'Groceries', date: '2026-02-05', createdAt: Date.now() },
];

const SAMPLE_ACCOUNTS: Account[] = [
  { id: '1', name: 'Main Checking', type: 'checking', balance: 50000, currency: 'INR', icon: '💳', color: 'bg-blue-500', createdAt: Date.now() },
  { id: '2', name: 'Savings', type: 'savings', balance: 100000, currency: 'INR', icon: '🏦', color: 'bg-green-500', createdAt: Date.now() },
];

function load<T>(key: string, fallback: T): T {
  const s = localStorage.getItem(key);
  return s ? JSON.parse(s) : fallback;
}

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => load('cf-transactions', SAMPLE_TRANSACTIONS));
  const [budgets, setBudgets] = useState<Budget[]>(() => load('cf-budgets', []));
  const [accounts, setAccounts] = useState<Account[]>(() => load('cf-accounts', SAMPLE_ACCOUNTS));
  const [view, setView] = useState<'dashboard' | 'transactions' | 'budgets' | 'accounts' | 'export' | 'goals'>('dashboard');
  const [showAdd, setShowAdd] = useState(false);
  const [dark, setDark] = useState(() => load('cf-dark', true));

  useEffect(() => { localStorage.setItem('cf-transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('cf-budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('cf-accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => {
    localStorage.setItem('cf-dark', JSON.stringify(dark));
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

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

  const handleImport = (data: ExportData) => {
    setTransactions(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newTxns = data.transactions.filter(t => !existingIds.has(t.id));
      return [...prev, ...newTxns];
    });
    setBudgets(prev => {
      const existingIds = new Set(prev.map(b => b.id));
      const newBudgets = data.budgets.filter(b => !existingIds.has(b.id));
      return [...prev, ...newBudgets];
    });
    setAccounts(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const newAccounts = data.accounts.filter(a => !existingIds.has(a.id));
      return [...prev, ...newAccounts];
    });
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const exportData: ExportData = {
    transactions,
    budgets,
    accounts,
    recurringTransactions: [],
    exportedAt: Date.now()
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header view={view} setView={setView} dark={dark} setDark={setDark} onAdd={() => setShowAdd(true)} />
      <main className="max-w-6xl mx-auto px-4 pb-8">
        {view === 'dashboard' && (
          <Dashboard transactions={transactions} balance={balance} totalIncome={totalIncome} totalExpense={totalExpense} />
        )}
        {view === 'transactions' && (
          <TransactionList transactions={transactions} onDelete={deleteTransaction} accounts={accounts} />
        )}
        {view === 'budgets' && (
          <Budgets budgets={budgets} transactions={transactions} onAddBudget={addBudget} onDeleteBudget={deleteBudget} />
        )}
        {view === 'accounts' && (
          <Accounts accounts={accounts} transactions={transactions} onAddAccount={addAccount} onDeleteAccount={deleteAccount} />
        )}
        {view === 'export' && (
          <Export data={exportData} onImport={handleImport} />
        )}
        {view === 'goals' && (
          <SavingsGoals transactions={transactions} />
        )}
      </main>
      {showAdd && <AddTransaction onAdd={addTransaction} onClose={() => setShowAdd(false)} accounts={accounts} />}
    </div>
  );
}
