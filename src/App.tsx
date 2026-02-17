import { useState, useEffect } from 'react';
import type { Transaction } from './types';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';
import Header from './components/Header';

// Sample data
const SAMPLE_DATA: Transaction[] = [
  { id: '1', type: 'income', amount: 50000, category: 'Salary', description: 'Monthly salary', date: '2026-02-01', createdAt: Date.now() },
  { id: '2', type: 'expense', amount: 12000, category: 'Rent', description: 'Monthly rent', date: '2026-02-02', createdAt: Date.now() },
  { id: '3', type: 'expense', amount: 3500, category: 'Food', description: 'Groceries', date: '2026-02-05', createdAt: Date.now() },
  { id: '4', type: 'expense', amount: 2000, category: 'Transport', description: 'Fuel', date: '2026-02-07', createdAt: Date.now() },
  { id: '5', type: 'expense', amount: 1500, category: 'Entertainment', description: 'Movie + dinner', date: '2026-02-10', createdAt: Date.now() },
  { id: '6', type: 'income', amount: 15000, category: 'Freelance', description: 'Web dev project', date: '2026-02-12', createdAt: Date.now() },
  { id: '7', type: 'expense', amount: 4000, category: 'Shopping', description: 'Clothes', date: '2026-02-14', createdAt: Date.now() },
  { id: '8', type: 'expense', amount: 800, category: 'Bills', description: 'Electricity', date: '2026-02-15', createdAt: Date.now() },
];

function load<T>(key: string, fallback: T): T {
  const s = localStorage.getItem(key);
  return s ? JSON.parse(s) : fallback;
}

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => load('cf-transactions', SAMPLE_DATA));
  const [view, setView] = useState<'dashboard' | 'transactions'>('dashboard');
  const [showAdd, setShowAdd] = useState(false);
  const [dark, setDark] = useState(() => load('cf-dark', true));

  useEffect(() => { localStorage.setItem('cf-transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => {
    localStorage.setItem('cf-dark', JSON.stringify(dark));
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const addTransaction = (t: Omit<Transaction, 'id' | 'createdAt'>) => {
    setTransactions(prev => [{ ...t, id: crypto.randomUUID(), createdAt: Date.now() }, ...prev]);
    setShowAdd(false);
  };

  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header view={view} setView={setView} dark={dark} setDark={setDark} onAdd={() => setShowAdd(true)} />
      <main className="max-w-4xl mx-auto px-4 pb-8">
        {view === 'dashboard' ? (
          <Dashboard transactions={transactions} balance={balance} totalIncome={totalIncome} totalExpense={totalExpense} />
        ) : (
          <TransactionList transactions={transactions} onDelete={deleteTransaction} />
        )}
      </main>
      {showAdd && <AddTransaction onAdd={addTransaction} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
