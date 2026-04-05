import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { financeApi } from '../services/mockApi';
import type { FinanceState, ThemeMode, Transaction, UserRole } from '../types/finance';
import { applyFilters, DEFAULT_FILTERS, getCategories } from '../utils/finance';
import { AppContext } from './AppContext';

const THEME_STORAGE_KEY = 'finance-dashboard-theme';
const TRANSACTIONS_STORAGE_KEY = 'finance-dashboard-transactions-v1';

type AppAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Transaction[] }
  | { type: 'LOAD_FAILURE'; payload: string }
  | { type: 'SET_ROLE'; payload: UserRole }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'SET_FILTER'; payload: Partial<FinanceState['filters']> }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string };

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return 'light';
};

const isValidTransaction = (value: unknown): value is Transaction => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const hasValidType = candidate.type === 'income' || candidate.type === 'expense';

  return (
    typeof candidate.id === 'string' &&
    candidate.id.trim().length > 0 &&
    typeof candidate.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(candidate.date) &&
    typeof candidate.description === 'string' &&
    candidate.description.trim().length > 0 &&
    typeof candidate.amount === 'number' &&
    Number.isFinite(candidate.amount) &&
    candidate.amount > 0 &&
    typeof candidate.category === 'string' &&
    candidate.category.trim().length > 0 &&
    hasValidType
  );
};

const readPersistedTransactions = (): Transaction[] | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(TRANSACTIONS_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
      return null;
    }

    if (!parsed.every(isValidTransaction)) {
      window.localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
    return null;
  }
};

const persistTransactions = (transactions: Transaction[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
};

const initialState: FinanceState = {
  transactions: [],
  filters: DEFAULT_FILTERS,
  role: 'viewer',
  theme: getInitialTheme(),
  loading: false,
  error: null,
};

const reducer = (state: FinanceState, action: AppAction): FinanceState => {
  if (action.type === 'LOAD_START') {
    return { ...state, loading: true, error: null };
  }

  if (action.type === 'LOAD_SUCCESS') {
    return { ...state, loading: false, error: null, transactions: action.payload };
  }

  if (action.type === 'LOAD_FAILURE') {
    return { ...state, loading: false, error: action.payload };
  }

  if (action.type === 'SET_ROLE') {
    return { ...state, role: action.payload };
  }

  if (action.type === 'SET_THEME') {
    return { ...state, theme: action.payload };
  }

  if (action.type === 'SET_FILTER') {
    return { ...state, filters: { ...state.filters, ...action.payload } };
  }

  if (action.type === 'ADD_TRANSACTION') {
    return { ...state, transactions: [action.payload, ...state.transactions] };
  }

  if (action.type === 'UPDATE_TRANSACTION') {
    return {
      ...state,
      transactions: state.transactions.map((transaction) =>
        transaction.id === action.payload.id ? action.payload : transaction,
      ),
    };
  }

  if (action.type === 'DELETE_TRANSACTION') {
    return {
      ...state,
      transactions: state.transactions.filter((transaction) => transaction.id !== action.payload),
    };
  }

  return state;
};

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hasLoadedTransactions = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, state.theme);
  }, [state.theme]);

  useEffect(() => {
    if (!hasLoadedTransactions.current) {
      return;
    }

    persistTransactions(state.transactions);
  }, [state.transactions]);

  const loadTransactions = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });

    const persisted = readPersistedTransactions();

    if (persisted && persisted.length > 0) {
      hasLoadedTransactions.current = true;
      dispatch({ type: 'LOAD_SUCCESS', payload: persisted });
      return;
    }

    try {
      const response = await financeApi.getTransactions();
      hasLoadedTransactions.current = true;
      dispatch({ type: 'LOAD_SUCCESS', payload: response });
    } catch {
      dispatch({ type: 'LOAD_FAILURE', payload: 'Could not load transactions.' });
    }
  }, []);

  const addTransaction = useCallback(async (transaction: Transaction) => {
    const created = await financeApi.createTransaction(transaction);
    hasLoadedTransactions.current = true;
    dispatch({ type: 'ADD_TRANSACTION', payload: created });
  }, []);

  const updateTransaction = useCallback(async (transaction: Transaction) => {
    const updated = await financeApi.updateTransaction(transaction);
    hasLoadedTransactions.current = true;
    dispatch({ type: 'UPDATE_TRANSACTION', payload: updated });
  }, []);

  const deleteTransaction = useCallback(async (transactionId: string) => {
    await financeApi.deleteTransaction(transactionId);
    hasLoadedTransactions.current = true;
    dispatch({ type: 'DELETE_TRANSACTION', payload: transactionId });
  }, []);

  const setRole = useCallback((role: UserRole) => {
    dispatch({ type: 'SET_ROLE', payload: role });
  }, []);

  const setTheme = useCallback((theme: ThemeMode) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const setFilter = useCallback((patch: Partial<FinanceState['filters']>) => {
    dispatch({ type: 'SET_FILTER', payload: patch });
  }, []);

  const filteredTransactions = useMemo(
    () => applyFilters(state.transactions, state.filters),
    [state.transactions, state.filters],
  );

  const categories = useMemo(() => getCategories(state.transactions), [state.transactions]);

  const value = useMemo(
    () => ({
      state,
      filteredTransactions,
      categories,
      loadTransactions,
      setRole,
      setTheme,
      setFilter,
      addTransaction,
      updateTransaction,
      deleteTransaction,
    }),
    [
      state,
      filteredTransactions,
      categories,
      loadTransactions,
      setRole,
      setTheme,
      setFilter,
      addTransaction,
      updateTransaction,
      deleteTransaction,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
