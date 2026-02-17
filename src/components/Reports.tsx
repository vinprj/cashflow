import type { Transaction, Account, Budget } from '../types';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

interface ReportsProps {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
}

export default function Reports({ transactions, accounts, budgets }: ReportsProps) {
  const exportJSON = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      transactions,
      accounts,
      budgets
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `cashflow-export-${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Account'];
    const rows = transactions.map(t => {
      const account = accounts.find(a => a.id === t.accountId);
      return [
        t.date,
        t.type,
        t.category,
        t.description,
        t.amount,
        account?.name || 'None'
      ];
    });

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadFile(blob, `cashflow-transactions-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportMonthlyReport = () => {
    const now = new Date();
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthTransactions = transactions.filter(t => new Date(t.date) >= startOfMonth);

    const totalIncome = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // Group by category
    const expenseByCategory: Record<string, number> = {};
    monthTransactions.filter(t => t.type === 'expense').forEach(t => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });

    const report = `
📊 CASHFLOW MONTHLY REPORT
${monthName}
${'='.repeat(50)}

💰 SUMMARY
Total Income:   ₹${totalIncome.toLocaleString('en-IN')}
Total Expense:  ₹${totalExpense.toLocaleString('en-IN')}
Net Savings:    ₹${(totalIncome - totalExpense).toLocaleString('en-IN')}
Savings Rate:   ${totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0}%

📈 EXPENSES BY CATEGORY
${Object.entries(expenseByCategory)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, amt]) => `${cat.padEnd(20)} ₹${amt.toLocaleString('en-IN').padStart(12)}`)
  .join('\n')}

🏦 ACCOUNTS
${accounts.map(acc => {
  const balance = transactions
    .filter(t => t.accountId === acc.id)
    .reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);
  return `${acc.name.padEnd(20)} ₹${balance.toLocaleString('en-IN').padStart(12)}`;
}).join('\n')}

📝 TRANSACTIONS (${monthTransactions.length})
${monthTransactions.slice(0, 20).map(t => 
  `${t.date} | ${t.type === 'income' ? '+' : '-'}₹${t.amount.toLocaleString('en-IN').padStart(10)} | ${t.category} | ${t.description}`
).join('\n')}
${monthTransactions.length > 20 ? `\n... and ${monthTransactions.length - 20} more` : ''}

${'='.repeat(50)}
Generated on ${new Date().toLocaleString('en-IN')}
`.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    downloadFile(blob, `cashflow-report-${monthName.replace(' ', '-').toLowerCase()}.txt`);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Export Reports</h2>

      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Monthly Report (Text)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Detailed summary with transactions, categories, and account balances
              </p>
              <button
                onClick={exportMonthlyReport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Transactions (CSV)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Export all transactions for analysis in Excel or Google Sheets
              </p>
              <button
                onClick={exportCSV}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Full Backup (JSON)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Complete backup of all data (transactions, accounts, budgets)
              </p>
              <button
                onClick={exportJSON}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <h3 className="font-semibold mb-2">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-gray-500">Total Transactions</div>
            <div className="font-semibold">{transactions.length}</div>
          </div>
          <div>
            <div className="text-gray-500">Accounts</div>
            <div className="font-semibold">{accounts.length}</div>
          </div>
          <div>
            <div className="text-gray-500">Total Income</div>
            <div className="font-semibold text-green-600">₹{totalIncome.toLocaleString('en-IN')}</div>
          </div>
          <div>
            <div className="text-gray-500">Total Expense</div>
            <div className="font-semibold text-red-600">₹{totalExpense.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
