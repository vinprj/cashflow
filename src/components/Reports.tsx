import { useMemo, useRef } from 'react';
import { Download, Upload, FileText, FileSpreadsheet, Calendar, TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react';
import type { Transaction, Account, Budget, ExportData } from '../types';
import { CATEGORY_ICONS } from '../types';

interface ReportsProps {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  onImport: (data: ExportData) => void;
}

export default function Reports({ transactions, accounts, budgets, onImport }: ReportsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  // Current month data
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(currentMonth));
  }, [transactions, currentMonth]);

  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthlyExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const monthlySavings = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome * 100) : 0;

  const expenseByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    monthlyTransactions.filter(t => t.type === 'expense').forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.amount;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value, icon: CATEGORY_ICONS[name] || '📌' }))
      .sort((a, b) => b.value - a.value);
  }, [monthlyTransactions]);

  const incomeByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    monthlyTransactions.filter(t => t.type === 'income').forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.amount;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value, icon: CATEGORY_ICONS[name] || '📌' }))
      .sort((a, b) => b.value - a.value);
  }, [monthlyTransactions]);

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      transactions,
      accounts,
      budgets
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `cashflow-backup-${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount (₹)', 'Account'];
    const rows = monthlyTransactions.map(t => {
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
    downloadFile(blob, `cashflow-${monthName.replace(' ', '-').toLowerCase()}.csv`);
  };

  const exportMonthlyReport = () => {
    const report = `
📊 CASHFLOW MONTHLY REPORT
${monthName}
${'='.repeat(50)}

💰 SUMMARY
Total Income:   ${formatINR(monthlyIncome)}
Total Expense:  ${formatINR(monthlyExpense)}
Net Savings:    ${formatINR(monthlySavings)}
Savings Rate:   ${savingsRate.toFixed(1)}%

📈 INCOME BY SOURCE
${incomeByCategory.map(i => `${i.icon} ${i.name.padEnd(15)} ${formatINR(i.value).padStart(12)}`).join('\n')}

📉 EXPENSES BY CATEGORY
${expenseByCategory.map(e => `${e.icon} ${e.name.padEnd(15)} ${formatINR(e.value).padStart(12)}`).join('\n')}

🏦 ACCOUNTS
${accounts.map(acc => `${acc.icon} ${acc.name.padEnd(15)} ${formatINR(acc.balance).padStart(12)}`).join('\n')}

📝 TRANSACTIONS (${monthlyTransactions.length})
${monthlyTransactions.slice(0, 30).map(t => 
  `${t.date} | ${t.type === 'income' ? '+' : '-'}${formatINR(t.amount).padStart(10)} | ${t.category.padEnd(12)} | ${t.description}`
).join('\n')}
${monthlyTransactions.length > 30 ? `\n... and ${monthlyTransactions.length - 30} more` : ''}

${'='.repeat(50)}
Generated on ${new Date().toLocaleString('en-IN')}
`.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    downloadFile(blob, `cashflow-report-${monthName.replace(' ', '-').toLowerCase()}.txt`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as ExportData;
        onImport(imported);
        alert('Data imported successfully!');
      } catch {
        alert('Failed to import. Invalid file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Reports</h2>
        <p className="text-secondary text-sm mt-1">Analyze your finances and export data</p>
      </div>

      {/* Monthly Summary */}
      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-label flex items-center gap-2">
            <TrendingUp size={16} /> Income
          </div>
          <div className="stat-value income">{formatINR(monthlyIncome)}</div>
          <div className="stat-subtitle">{monthName}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label flex items-center gap-2">
            <TrendingDown size={16} /> Expenses
          </div>
          <div className="stat-value expense">{formatINR(monthlyExpense)}</div>
          <div className="stat-subtitle">{monthName}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label flex items-center gap-2">
            <BarChart3 size={16} /> Savings
          </div>
          <div className={`stat-value ${monthlySavings >= 0 ? 'income' : 'expense'}`}>
            {formatINR(monthlySavings)}
          </div>
          <div className="stat-subtitle">{savingsRate.toFixed(1)}% of income</div>
        </div>
        <div className="stat-card">
          <div className="stat-label flex items-center gap-2">
            <PieChart size={16} /> Transactions
          </div>
          <div className="stat-value">{monthlyTransactions.length}</div>
          <div className="stat-subtitle">This month</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid-2 mb-6">
        {/* Income Sources */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Income Sources</h3>
          </div>
          {incomeByCategory.length > 0 ? (
            <div className="category-breakdown">
              {incomeByCategory.map((item) => (
                <div key={item.name} className="breakdown-item">
                  <div className="breakdown-icon">{item.icon}</div>
                  <div className="breakdown-info">
                    <div className="breakdown-name">{item.name}</div>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill income"
                        style={{ width: `${(item.value / incomeByCategory[0].value) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="breakdown-amount">{formatINR(item.value)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No income this month</p>
            </div>
          )}
        </div>

        {/* Expense Categories */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Expense Categories</h3>
          </div>
          {expenseByCategory.length > 0 ? (
            <div className="category-breakdown">
              {expenseByCategory.map((item) => (
                <div key={item.name} className="breakdown-item">
                  <div className="breakdown-icon">{item.icon}</div>
                  <div className="breakdown-info">
                    <div className="breakdown-name">{item.name}</div>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill expense"
                        style={{ width: `${(item.value / expenseByCategory[0].value) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="breakdown-amount">{formatINR(item.value)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No expenses this month</p>
            </div>
          )}
        </div>
      </div>

      {/* Export Options */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Export Data</h3>
        </div>
        
        <div className="export-grid">
          {/* Monthly Report */}
          <div className="export-card">
            <div className="export-icon">
              <FileText size={24} />
            </div>
            <div className="export-info">
              <h4>Monthly Report</h4>
              <p>Formatted text report with summary and transactions</p>
            </div>
            <button onClick={exportMonthlyReport} className="btn btn-secondary">
              <Download size={16} />
              Download
            </button>
          </div>

          {/* CSV Export */}
          <div className="export-card">
            <div className="export-icon">
              <FileSpreadsheet size={24} />
            </div>
            <div className="export-info">
              <h4>CSV Spreadsheet</h4>
              <p>Export transactions for Excel or Google Sheets</p>
            </div>
            <button onClick={exportCSV} className="btn btn-secondary">
              <Download size={16} />
              Download
            </button>
          </div>

          {/* Full Backup */}
          <div className="export-card">
            <div className="export-icon">
              <Calendar size={24} />
            </div>
            <div className="export-info">
              <h4>Full Backup</h4>
              <p>Complete JSON backup of all data</p>
            </div>
            <button onClick={exportJSON} className="btn btn-primary">
              <Download size={16} />
              Download
            </button>
          </div>

          {/* Import */}
          <div className="export-card import-card">
            <div className="export-icon">
              <Upload size={24} />
            </div>
            <div className="export-info">
              <h4>Import Data</h4>
              <p>Restore from a JSON backup file</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button onClick={handleImportClick} className="btn btn-secondary">
              <Upload size={16} />
              Choose File
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .stat-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }
        
        .category-breakdown {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .breakdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .breakdown-icon {
          font-size: 1.25rem;
          width: 32px;
          text-align: center;
        }
        
        .breakdown-info {
          flex: 1;
          min-width: 0;
        }
        
        .breakdown-name {
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        
        .breakdown-bar {
          height: 4px;
          background: var(--bg-hover);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .breakdown-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s ease;
        }
        
        .breakdown-fill.income {
          background: var(--accent-green);
        }
        
        .breakdown-fill.expense {
          background: var(--accent-red);
        }
        
        .breakdown-amount {
          font-size: 0.9rem;
          font-weight: 600;
          min-width: 80px;
          text-align: right;
        }
        
        .export-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        
        @media (max-width: 768px) {
          .export-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .export-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
        }
        
        .export-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-hover);
          border-radius: var(--radius-md);
          color: var(--accent-primary);
          flex-shrink: 0;
        }
        
        .export-info {
          flex: 1;
          min-width: 0;
        }
        
        .export-info h4 {
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        
        .export-info p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        
        .hidden {
          display: none;
        }
      `}</style>
    </div>
  );
}
