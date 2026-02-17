import { Sun, Moon, LayoutDashboard, List, Plus, Wallet, Target, Building2, Download, PiggyBank } from 'lucide-react';

interface Props { 
  view: string; 
  setView: (v: 'dashboard' | 'transactions' | 'budgets' | 'accounts' | 'export' | 'goals') => void; 
  dark: boolean; 
  setDark: (d: boolean) => void; 
  onAdd: () => void; 
}

export default function Header({ view, setView, dark, setDark, onAdd }: Props) {
  const views = [
    { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { key: 'transactions', icon: List, label: 'Transactions' },
    { key: 'budgets', icon: Target, label: 'Budgets' },
    { key: 'goals', icon: PiggyBank, label: 'Goals' },
    { key: 'accounts', icon: Building2, label: 'Accounts' },
    { key: 'export', icon: Download, label: 'Export' },
  ] as const;

  return (
    <header className="sticky top-0 z-10 fin-card backdrop-blur-lg border-b-2 border-blue-200/50 dark:border-blue-800/50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-3xl font-bold font-manrope flex items-center gap-3">
            <div className="w-12 h-12 money-gradient rounded-xl flex items-center justify-center">
              <Wallet size={26} className="text-white" />
            </div>
            <span className="money-gradient bg-clip-text text-transparent">CashFlow</span>
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={onAdd} className="btn-pro text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-semibold">
              <Plus size={20} />
              Add
            </button>
            <button onClick={() => setDark(!dark)} className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 smooth">
              {dark ? <Sun size={22} className="text-yellow-500" /> : <Moon size={22} className="text-blue-600" />}
            </button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {views.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setView(key as any)}
              className={`px-4 py-2.5 rounded-xl smooth whitespace-nowrap flex items-center gap-2 text-sm font-semibold ${
                view === key
                  ? 'money-gradient text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
