import { Sun, Moon, LayoutDashboard, List, Plus, Wallet, Target, Building2, Repeat, FileText } from 'lucide-react';

interface Props { 
  view: string; 
  setView: (v: 'dashboard' | 'transactions' | 'budgets' | 'accounts' | 'recurring' | 'reports') => void; 
  dark: boolean; 
  setDark: (d: boolean) => void; 
  onAdd: () => void; 
}

export default function Header({ view, setView, dark, setDark, onAdd }: Props) {
  const views = [
    { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { key: 'transactions', icon: List, label: 'Transactions' },
    { key: 'budgets', icon: Target, label: 'Budgets' },
    { key: 'accounts', icon: Building2, label: 'Accounts' },
    { key: 'recurring', icon: Repeat, label: 'Recurring' },
    { key: 'reports', icon: FileText, label: 'Reports' },
  ] as const;

  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Wallet size={22} className="text-emerald-600" />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">CashFlow</span>
          </h1>
          <div className="flex items-center gap-1">
            <button onClick={onAdd} className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus size={20} />
            </button>
            <button onClick={() => setDark(!dark)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {views.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setView(key as any)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 text-sm ${
                view === key
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 font-medium'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
