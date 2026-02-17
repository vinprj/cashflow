import { useState } from 'react';
import { X } from 'lucide-react';
import type { Transaction, Account } from '../types';
import { CATEGORIES } from '../types';

interface Props { 
  onAdd: (t: Omit<Transaction, 'id' | 'createdAt'>) => void; 
  onClose: () => void;
  accounts: Account[];
}

export default function AddTransaction({ onAdd, onClose, accounts }: Props) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');

  const handleSubmit = () => {
    if (!amount) return;

    onAdd({ 
      type, 
      amount: parseFloat(amount), 
      category, 
      description, 
      date,
      accountId: accountId || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Add Transaction</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            {(['expense', 'income'] as const).map(t => (
              <button 
                key={t} 
                onClick={() => { setType(t); setCategory(CATEGORIES[t][0]); }}
                className={`flex-1 py-2 rounded-lg font-medium capitalize transition-colors ${
                  type === t 
                    ? (t === 'income' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white') 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            placeholder="Amount (₹)" 
            className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 text-lg" 
          />

          <select 
            value={category} 
            onChange={e => setCategory(e.target.value)} 
            className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none"
          >
            {CATEGORIES[type].map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <input 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Description" 
            className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500" 
          />

          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none" 
          />

          {accounts.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">
                Account (optional)
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none"
              >
                <option value="">None</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.icon} {acc.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={handleSubmit}
            disabled={!amount} 
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium transition-colors"
          >
            Add {type === 'income' ? 'Income' : 'Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}
