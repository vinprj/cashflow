import { useState } from 'react';
import type { RecurringTransaction, Account } from '../types';
import { Plus, Trash2, Play, Pause } from 'lucide-react';
import { CATEGORIES, CATEGORY_ICONS } from '../types';

interface RecurringTransactionsProps {
  recurring: RecurringTransaction[];
  accounts: Account[];
  onAdd: (rt: Omit<RecurringTransaction, 'id' | 'createdAt' | 'lastGenerated'>) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function RecurringTransactions({ recurring, accounts, onAdd, onDelete, onToggle }: RecurringTransactionsProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<RecurringTransaction['frequency']>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    onAdd({
      type,
      amount: parseFloat(amount),
      category,
      description: description.trim(),
      frequency,
      startDate,
      accountId: accountId || undefined,
      enabled: true
    });

    setAmount('');
    setDescription('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recurring Transactions</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Recurring
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(CATEGORIES.income[0]); }}
              className={`flex-1 py-2 rounded-lg ${type === 'income' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(CATEGORIES.expense[0]); }}
              className={`flex-1 py-2 rounded-lg ${type === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}
            >
              Expense
            </button>
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
          >
            {CATEGORIES[type].map(cat => (
              <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat}</option>
            ))}
          </select>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (₹)"
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
          />

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
          />

          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
            />
          </div>

          {accounts.length > 0 && (
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
            >
              <option value="">No account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.icon} {acc.name}</option>
              ))}
            </select>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Create
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {recurring.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No recurring transactions. Add one to automate your finances!
          </div>
        ) : (
          recurring.map(rt => {
            const account = accounts.find(a => a.id === rt.accountId);
            
            return (
              <div key={rt.id} className={`p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 ${!rt.enabled ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{CATEGORY_ICONS[rt.category]}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{rt.description || rt.category}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${rt.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                          {rt.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        ₹{rt.amount.toLocaleString('en-IN')} • {rt.frequency}
                      </div>
                      {account && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {account.icon} {account.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggle(rt.id)}
                      className={`p-2 rounded-lg ${rt.enabled ? 'text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      {rt.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => onDelete(rt.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
