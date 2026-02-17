import { useMemo, useState } from 'react';
import { Trash2, RefreshCw, Search, Calendar } from 'lucide-react';
import type { Transaction, Account } from '../types';
import { CATEGORY_ICONS } from '../types';

interface Props { 
  transactions: Transaction[]; 
  accounts: Account[];
  onDelete: (id: string) => void; 
}

export default function TransactionList({ transactions, accounts, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

  const filtered = useMemo(() => {
    let result = [...transactions];
    
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(t => 
        t.description?.toLowerCase().includes(s) ||
        t.category.toLowerCase().includes(s)
      );
    }
    
    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }
    
    if (categoryFilter !== 'all') {
      result = result.filter(t => t.category === categoryFilter);
    }
    
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, typeFilter, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-secondary text-sm mt-1">{transactions.length} total transactions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="input select w-auto"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input select w-auto"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        {/* Summary */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-subtle">
          <div className="flex items-center gap-2">
            <span className="text-muted text-sm">Showing:</span>
            <span className="font-semibold">{filtered.length}</span>
          </div>
          {typeFilter === 'all' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-muted text-sm">Income:</span>
                <span className="font-semibold text-income">{formatINR(totalIncome)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted text-sm">Expense:</span>
                <span className="font-semibold text-expense">{formatINR(totalExpense)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="empty-icon">
            <Calendar size={48} className="mx-auto text-muted" />
          </div>
          <p className="text-muted mt-4">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-2 stagger-children">
          {filtered.map(t => {
            const account = accounts.find(a => a.id === t.accountId);
            
            return (
              <div 
                key={t.id} 
                className="transaction-row group"
              >
                <div className="transaction-icon-wrapper">
                  <div className="transaction-icon">
                    {CATEGORY_ICONS[t.category] || '📌'}
                  </div>
                </div>
                
                <div className="transaction-details">
                  <div className="flex items-center gap-2">
                    <span className="transaction-desc">{t.description || t.category}</span>
                    {t.isRecurring && (
                      <span className="badge-recurring">
                        <RefreshCw size={12} />
                      </span>
                    )}
                  </div>
                  <div className="transaction-meta">
                    <span>{t.category}</span>
                    <span className="meta-dot">•</span>
                    <span>{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {account && (
                      <>
                        <span className="meta-dot">•</span>
                        <span>{account.icon} {account.name}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className={`transaction-amount ${t.type}`}>
                  <span className="amount-value">
                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                
                <button 
                  onClick={() => onDelete(t.id)} 
                  className="btn-delete"
                  title="Delete transaction"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
