import type { ExportData } from '../types';
import { Download, Upload } from 'lucide-react';

interface Props {
  data: ExportData;
  onImport: (data: ExportData) => void;
}

export default function Export({ data, onImport }: Props) {
  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as ExportData;
        onImport(imported);
        alert('Data imported successfully!');
      } catch (err) {
        alert('Failed to import data. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-manrope mb-2">Export & Backup</h2>
        <p className="text-gray-500 dark:text-gray-400">Download or restore your financial data</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="fin-card rounded-2xl p-8 text-center fade-in-up">
          <div className="w-20 h-20 money-gradient rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold font-manrope mb-2">Export Data</h3>
          <p className="text-gray-500 mb-6">Download all your transactions, budgets, and accounts as JSON</p>
          <button
            onClick={handleExport}
            className="btn-pro text-white px-6 py-3 rounded-xl font-semibold w-full"
          >
            Download Backup
          </button>
          <div className="mt-4 text-sm text-gray-500">
            <p>{data.transactions.length} transactions</p>
            <p>{data.budgets.length} budgets</p>
            <p>{data.accounts.length} accounts</p>
          </div>
        </div>

        <div className="fin-card rounded-2xl p-8 text-center fade-in-up">
          <div className="w-20 h-20 expense-gradient rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold font-manrope mb-2">Import Data</h3>
          <p className="text-gray-500 mb-6">Restore from a previously exported JSON file</p>
          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <div className="btn-pro text-white px-6 py-3 rounded-xl font-semibold cursor-pointer">
              Choose File
            </div>
          </label>
          <p className="mt-4 text-xs text-gray-500">
            ⚠️ Importing will merge with existing data
          </p>
        </div>
      </div>

      <div className="fin-card rounded-2xl p-6">
        <h3 className="font-bold mb-3">CSV Export (Premium Feature)</h3>
        <p className="text-sm text-gray-500 mb-4">Export your transactions to CSV for Excel or Google Sheets</p>
        <button className="pro-tag cursor-not-allowed opacity-50">
          Coming Soon
        </button>
      </div>
    </div>
  );
}
