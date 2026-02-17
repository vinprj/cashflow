import { Sun, Moon, LayoutDashboard, List, Plus, Wallet } from 'lucide-react';

interface Props { view: string; setView: (v: 'dashboard' | 'transactions') => void; dark: boolean; setDark: (d: boolean) => void; onAdd: () => void; }

export default function Header({ view, setView, dark, setDark, onAdd }: Props) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Wallet size={22} className="text-emerald-600" />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">CashFlow</span>
        </h1>
        <div className="flex items-center gap-1">
          <button onClick={() => setView('dashboard')} className={`p-2 rounded-lg transition-colors ${view === 'dashboard' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <LayoutDashboard size={20} />
          </button>
          <button onClick={() => setView('transactions')} className={`p-2 rounded-lg transition-colors ${view === 'transactions' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <List size={20} />
          </button>
          <button onClick={onAdd} className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white ml-1"><Plus size={20} /></button>
          <button onClick={() => setDark(!dark)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
