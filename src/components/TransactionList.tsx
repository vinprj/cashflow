import { Trash2, Repeat } from 'lucide-react';
import type { Transaction, Account } from '../types';
import { CATEGORY_ICONS } from '../types';

interface Props { 
  transactions: Transaction[]; 
  accounts: Account[];
  onDelete: (id: string) => void; 
}

export default function TransactionList({ transactions, accounts, onDelete }: Props) {
  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

  return (
    <div className="mt-6 space-y-2">
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No transactions yet. Add one to get started!
        </div>
      ) : (
        sorted.map(t => {
          const account = accounts.find(a => a.id === t.accountId);
          
          return (
            <div 
              key={t.id} 
              className="group flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-gray-100 dark:bg-gray-800">
                {CATEGORY_ICONS[t.category] || '📌'}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{t.description}</p>
                  {t.isRecurring && (
                    <span className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                      <Repeat className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span>{t.category}</span>
                  <span>•</span>
                  <span>{t.date}</span>
                  {account && (
                    <>
                      <span>•</span>
                      <span>{account.icon} {account.name}</span>
                    </>
                  )}
                </div>
              </div>
              
              <p className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
              </p>
              
              <button 
                onClick={() => onDelete(t.id)} 
                className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
