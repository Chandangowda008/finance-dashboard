import { createContext } from 'react';
import type { FinanceState, ThemeMode, Transaction, UserRole } from '../types/finance';

export interface AppContextValue {
  state: FinanceState;
  filteredTransactions: Transaction[];
  categories: string[];
  loadTransactions: () => Promise<void>;
  setRole: (role: UserRole) => void;
  setTheme: (theme: ThemeMode) => void;
  setFilter: (patch: Partial<FinanceState['filters']>) => void;
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);
