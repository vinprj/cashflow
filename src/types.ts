export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: number;
  accountId?: string;
  isRecurring?: boolean;
  recurringId?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'monthly' | 'yearly';
  createdAt: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash';
  balance: number;
  currency: string;
  icon: string;
  color: string;
  createdAt: number;
}

export interface RecurringTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  accountId?: string;
  enabled: boolean;
  lastProcessed?: string;
  createdAt: number;
}

export interface ExportData {
  transactions: Transaction[];
  budgets: Budget[];
  accounts: Account[];
  recurringTransactions: RecurringTransaction[];
  exportedAt: number;
}

export const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Bonus', 'Other'],
  expense: ['Food', 'Transport', 'Rent', 'Shopping', 'Entertainment', 'Health', 'Education', 'Bills', 'Insurance', 'Utilities', 'Other'],
};

export const CATEGORY_ICONS: Record<string, string> = {
  Salary: '💰', Freelance: '💻', Investment: '📈', Gift: '🎁', Refund: '↩️', Bonus: '🎯',
  Food: '🍕', Transport: '🚗', Rent: '🏠', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Education: '📚', Bills: '📱', Insurance: '🛡️', Utilities: '⚡', Other: '📌',
};

export const ACCOUNT_ICONS: Record<string, string> = {
  checking: '💳',
  savings: '🏦',
  credit: '💰',
  cash: '💵'
};
