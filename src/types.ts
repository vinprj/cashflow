export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: number;
}

export interface Budget {
  category: string;
  limit: number;
}

export const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Rent', 'Shopping', 'Entertainment', 'Health', 'Education', 'Bills', 'Other'],
};

export const CATEGORY_ICONS: Record<string, string> = {
  Salary: '💰', Freelance: '💻', Investment: '📈', Gift: '🎁',
  Food: '🍕', Transport: '🚗', Rent: '🏠', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Education: '📚', Bills: '📱', Other: '📌',
};
