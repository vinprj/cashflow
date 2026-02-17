import { 
  Sun, Moon, LayoutDashboard, List, Plus, Wallet, Target, 
  RefreshCw, FileBarChart, TrendingUp, TrendingDown 
} from 'lucide-react';

interface Props { 
  view: string; 
  setView: (v: 'dashboard' | 'transactions' | 'budgets' | 'accounts' | 'recurring' | 'reports') => void; 
  dark: boolean; 
  setDark: (d: boolean) => void; 
  onAdd: () => void;
  totalIncome: number;
  totalExpense: number;
}

export default function Header({ view, setView, dark, setDark, onAdd, totalIncome, totalExpense }: Props) {
  const views = [
    { key: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { key: 'transactions', icon: List, label: 'Transactions' },
    { key: 'budgets', icon: Target, label: 'Budgets' },
    { key: 'accounts', icon: Wallet, label: 'Accounts' },
    { key: 'recurring', icon: RefreshCw, label: 'Recurring' },
    { key: 'reports', icon: FileBarChart, label: 'Reports' },
  ] as const;

  const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <header className="header-glass">
      <div className="header-inner">
        <div className="header-top">
          <div className="logo-section">
            <div className="logo-icon">
              <Wallet className="logo-wallet" />
            </div>
            <span className="logo-text">CashFlow</span>
          </div>
          
          <div className="header-actions">
            <div className="quick-stats">
              <div className="stat-pill income-pill">
                <TrendingUp size={14} />
                <span>{formatINR(totalIncome)}</span>
              </div>
              <div className="stat-pill expense-pill">
                <TrendingDown size={14} />
                <span>{formatINR(totalExpense)}</span>
              </div>
            </div>
            
            <button onClick={onAdd} className="btn-add">
              <Plus size={20} />
              <span>Add</span>
            </button>
            
            <button onClick={() => setDark(!dark)} className="btn-theme" aria-label="Toggle theme">
              {dark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>
          </div>
        </div>
        
        <nav className="nav-tabs">
          {views.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setView(key as any)}
              className={`nav-tab ${view === key ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
