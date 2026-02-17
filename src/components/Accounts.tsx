import { useState, useMemo } from 'react';
import { Plus, Trash2, Wallet } from 'lucide-react';
import type { Account } from '../types';
import { ACCOUNT_ICONS } from '../types';

interface Props {
  accounts: Account[];
  accountBalances: Record<string, number>;
  onAddAccount: (account: Omit<Account, 'id' | 'createdAt'>) => void;
  onDeleteAccount: (id: string) => void;
}

const ACCOUNT_COLORS = [
  'bg-gradient-to-br from-blue-500 to-indigo-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-purple-500 to-pink-600',
  'bg-gradient-to-br from-amber-500 to-orange-600',
  'bg-gradient-to-br from-rose-500 to-red-600',
  'bg-gradient-to-br from-cyan-500 to-blue-600',
];

export default function Accounts({ accounts, accountBalances, onAddAccount, onDeleteAccount }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('checking');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);

  const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

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

  const totalBalance = useMemo(() => {
    return Object.values(accountBalances).reduce((s, b) => s + b, 0);
  }, [accountBalances]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Accounts</h2>
          <p className="text-secondary text-sm mt-1">Manage your financial accounts</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary">
          <Plus size={18} />
          Add Account
        </button>
      </div>

      {/* Total Balance Card */}
      <div className="total-balance-card mb-6">
        <div className="total-balance-content">
          <div className="total-balance-label">Total Net Worth</div>
          <div className="total-balance-value">{formatINR(totalBalance)}</div>
          <div className="total-balance-count">
            Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="total-balance-glow" />
      </div>

      {/* Add Account Form */}
      {showAdd && (
        <div className="card mb-6 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Account Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., HDFC Savings"
                className="input"
              />
            </div>
            
            <div className="grid-2 gap-4">
              <div>
                <label className="form-label">Account Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Account['type'])}
                  className="input select"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="credit">Credit Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="form-label">Initial Balance (₹)</label>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0"
                  className="input"
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Color</label>
              <div className="color-picker">
                {ACCOUNT_COLORS.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`color-swatch ${c} ${color === c ? 'selected' : ''}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                Create Account
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account Cards */}
      {accounts.length === 0 ? (
        <div className="card text-center py-12">
          <div className="empty-icon">
            <Wallet size={48} className="mx-auto text-muted" />
          </div>
          <h3 className="text-lg font-semibold mt-4 mb-2">No accounts yet</h3>
          <p className="text-muted mb-6">Add your first account to start tracking</p>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary">
            <Plus size={18} />
            Add First Account
          </button>
        </div>
      ) : (
        <div className="grid-2 gap-4 stagger-children">
          {accounts.map(account => {
            const currentBalance = accountBalances[account.id] ?? account.balance;
            const isNegative = currentBalance < 0;
            
            return (
              <div key={account.id} className="account-card">
                <div className="account-card-header">
                  <div className={`account-icon-large ${account.color}`}>
                    {account.icon}
                  </div>
                  <button
                    onClick={() => onDeleteAccount(account.id)}
                    className="btn-icon-ghost"
                    title="Delete account"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="account-card-name">{account.name}</div>
                <div className="account-card-type">{account.type}</div>
                
                <div className={`account-card-balance ${isNegative ? 'negative' : ''}`}>
                  {formatINR(currentBalance)}
                </div>
                
                {account.type === 'credit' && (
                  <div className="account-card-note">
                    Credit card balance
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .total-balance-card {
          position: relative;
          background: var(--gradient-primary);
          border-radius: var(--radius-xl);
          padding: 2rem;
          overflow: hidden;
        }
        
        .total-balance-content {
          position: relative;
          z-index: 1;
        }
        
        .total-balance-label {
          font-size: 0.9rem;
          font-weight: 500;
          opacity: 0.9;
          margin-bottom: 0.5rem;
        }
        
        .total-balance-value {
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }
        
        .total-balance-count {
          font-size: 0.85rem;
          opacity: 0.8;
        }
        
        .total-balance-glow {
          position: absolute;
          top: -50%;
          right: -20%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        
        .account-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          transition: all 0.3s ease;
        }
        
        .account-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-2px);
        }
        
        .account-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .account-icon-large {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        .account-card-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        
        .account-card-type {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: capitalize;
          margin-bottom: 1rem;
        }
        
        .account-card-balance {
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        
        .account-card-balance.negative {
          color: var(--accent-red);
        }
        
        .account-card-note {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
        }
        
        .color-picker {
          display: flex;
          gap: 0.75rem;
        }
        
        .color-swatch {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .color-swatch:hover {
          transform: scale(1.1);
        }
        
        .color-swatch.selected {
          border-color: white;
          box-shadow: 0 0 0 2px var(--accent-primary);
        }
        
        .form-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }
        
        .btn-icon-ghost {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--text-muted);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-icon-ghost:hover {
          background: var(--bg-hover);
          color: var(--accent-red);
        }
      `}</style>
    </div>
  );
}
