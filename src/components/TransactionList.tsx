import { Trash2 } from 'lucide-react';
import type { Transaction } from '../types';
import { CATEGORY_ICONS } from '../types';

interface Props { transactions: Transaction[]; onDelete: (id: string) => void; }

export default function TransactionList({ transactions, onDelete }: Props) {
  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

  return (
    <div className="mt-6 space-y-2">
      {sorted.map(t => (
        <div key={t.id} className="group flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-gray-100 dark:bg-gray-800">
            {CATEGORY_ICONS[t.category] || '📌'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{t.description}</p>
            <p className="text-xs text-gray-500">{t.category} • {t.date}</p>
          </div>
          <p className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
            {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
          </p>
          <button onClick={() => onDelete(t.id)} className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
