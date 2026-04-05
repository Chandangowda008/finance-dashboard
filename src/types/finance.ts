export type TransactionType = 'income' | 'expense';
export type UserRole = 'viewer' | 'admin';
export type ThemeMode = 'light' | 'dark';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
}

export interface TransactionFilters {
  search: string;
  type: 'all' | TransactionType;
  category: 'all' | string;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export interface DashboardInsight {
  title: string;
  value: string;
  helperText: string;
}

export interface FinanceState {
  transactions: Transaction[];
  filters: TransactionFilters;
  role: UserRole;
  theme: ThemeMode;
  loading: boolean;
  error: string | null;
}

export interface MonthlyPoint {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryPoint {
  category: string;
  value: number;
}
