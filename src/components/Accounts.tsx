import { useState } from 'react';
import type { Account, Transaction } from '../types';
import { Plus, Trash2, Wallet } from 'lucide-react';
import { ACCOUNT_ICONS } from '../types';

interface Props {
  accounts: Account[];
  transactions: Transaction[];
  onAddAccount: (account: Omit<Account, 'id' | 'createdAt'>) => void;
  onDeleteAccount: (id: string) => void;
}

const ACCOUNT_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'
];

export default function Accounts({ accounts, transactions, onAddAccount, onDeleteAccount }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('checking');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && balance) {
      onAddAccount({
        name,
        type,
        balance: parseFloat(balance),
        currency: 'INR',
        icon: ACCOUNT_ICONS[type],
        color,
      });
      setName('');
      setBalance('');
      setShowAdd(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-manrope">Accounts</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage your financial accounts</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-pro text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2">
          <Plus size={20} />
          Add Account
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="fin-card rounded-2xl p-6 space-y-4 fade-in-up">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Account Name"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 outline-none"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 outline-none"
          >
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="credit">Credit Card</option>
            <option value="cash">Cash</option>
          </select>
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="Initial Balance (₹)"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 outline-none"
          />
          <div className="flex gap-2">
            {ACCOUNT_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-10 h-10 rounded-full ${c} ${color === c ? 'ring-4 ring-blue-300' : ''}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 btn-pro text-white py-3 rounded-xl font-semibold">Create Account</button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 font-semibold">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {accounts.length === 0 ? (
          <div className="col-span-2 fin-card rounded-2xl p-12 text-center">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <p className="text-gray-500">No accounts yet. Create one to get started!</p>
          </div>
        ) : (
          accounts.map(account => {
            const accountTxns = transactions.filter(t => t.accountId === account.id);
            const income = accountTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const expense = accountTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            const currentBalance = account.balance + income - expense;

            return (
              <div key={account.id} className="fin-card rounded-2xl p-6 fade-in-up">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${account.color} rounded-xl flex items-center justify-center text-2xl`}>
                      {account.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-manrope">{account.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                    </div>
                  </div>
                  <button onClick={() => onDeleteAccount(account.id)} className="text-gray-400 hover:text-red-500 smooth">
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="text-3xl font-bold font-manrope money-gradient bg-clip-text text-transparent mb-2">
                  ₹{currentBalance.toLocaleString('en-IN')}
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-green-600 font-semibold">+₹{income.toLocaleString('en-IN')}</span>
                    <span className="text-gray-500 ml-1">in</span>
                  </div>
                  <div>
                    <span className="text-red-600 font-semibold">-₹{expense.toLocaleString('en-IN')}</span>
                    <span className="text-gray-500 ml-1">out</span>
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
