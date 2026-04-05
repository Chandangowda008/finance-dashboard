import { format, parseISO } from 'date-fns';
import type {
  CategoryPoint,
  DashboardInsight,
  MonthlyPoint,
  Transaction,
  TransactionFilters,
} from '../types/finance';

export const DEFAULT_FILTERS: TransactionFilters = {
  search: '',
  type: 'all',
  category: 'all',
  sortBy: 'date-desc',
};

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (date: string): string => format(parseISO(date), 'dd MMM yyyy');

export const applyFilters = (
  transactions: Transaction[],
  filters: TransactionFilters,
): Transaction[] => {
  const loweredSearch = filters.search.trim().toLowerCase();

  const filtered = transactions.filter((transaction) => {
    const matchesType = filters.type === 'all' || transaction.type === filters.type;
    const matchesCategory =
      filters.category === 'all' || transaction.category === filters.category;
    const matchesSearch =
      loweredSearch.length === 0 ||
      transaction.description.toLowerCase().includes(loweredSearch) ||
      transaction.category.toLowerCase().includes(loweredSearch);

    return matchesType && matchesCategory && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (filters.sortBy === 'date-desc') {
      return b.date.localeCompare(a.date);
    }

    if (filters.sortBy === 'date-asc') {
      return a.date.localeCompare(b.date);
    }

    if (filters.sortBy === 'amount-desc') {
      return b.amount - a.amount;
    }

    return a.amount - b.amount;
  });

  return sorted;
};

export const getSummary = (transactions: Transaction[]) => {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    income,
    expenses,
    balance: income - expenses,
  };
};

export const getMonthlyTrend = (transactions: Transaction[]): MonthlyPoint[] => {
  const grouped = new Map<string, { income: number; expense: number }>();

  transactions.forEach((transaction) => {
    const monthKey = transaction.date.slice(0, 7);
    const current = grouped.get(monthKey) ?? { income: 0, expense: 0 };

    if (transaction.type === 'income') {
      current.income += transaction.amount;
    } else {
      current.expense += transaction.amount;
    }

    grouped.set(monthKey, current);
  });

  return [...grouped.entries()]
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([month, totals]) => ({
      month: format(parseISO(`${month}-01`), 'MMM yyyy'),
      income: totals.income,
      expense: totals.expense,
      balance: totals.income - totals.expense,
    }));
};

export const getCategoryBreakdown = (transactions: Transaction[]): CategoryPoint[] => {
  const grouped = new Map<string, number>();

  transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      grouped.set(transaction.category, (grouped.get(transaction.category) ?? 0) + transaction.amount);
    });

  return [...grouped.entries()]
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);
};

export const getInsights = (transactions: Transaction[]): DashboardInsight[] => {
  const breakdown = getCategoryBreakdown(transactions);
  const trend = getMonthlyTrend(transactions);

  const topCategory = breakdown[0];

  const currentMonth = trend[trend.length - 1];
  const previousMonth = trend[trend.length - 2];

  const monthlyDiff = currentMonth && previousMonth
    ? previousMonth.expense - currentMonth.expense
    : 0;

  const diffMessage =
    currentMonth && previousMonth
      ? monthlyDiff >= 0
        ? `${formatCurrency(monthlyDiff)} lower spend vs last month`
        : `${formatCurrency(Math.abs(monthlyDiff))} higher spend vs last month`
      : 'Not enough history for a month-over-month view';

  const avgExpense =
    transactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.amount, 0) /
    Math.max(transactions.filter((transaction) => transaction.type === 'expense').length, 1);

  const unusual = transactions
    .filter((transaction) => transaction.type === 'expense')
    .find((transaction) => transaction.amount > avgExpense * 2);

  return [
    {
      title: 'Highest Spend Category',
      value: topCategory ? `${topCategory.category} (${formatCurrency(topCategory.value)})` : 'No expense data',
      helperText: 'Based on available expense transactions',
    },
    {
      title: 'Monthly Comparison',
      value: currentMonth ? currentMonth.month : 'N/A',
      helperText: diffMessage,
    },
    {
      title: 'Observation',
      value: unusual ? unusual.description : 'Spending is stable',
      helperText: unusual
        ? `Unusually large transaction: ${formatCurrency(unusual.amount)}`
        : 'No major outlier transactions detected',
    },
  ];
};

export const getCategories = (transactions: Transaction[]): string[] =>
  [...new Set(transactions.map((transaction) => transaction.category))].sort((a, b) =>
    a.localeCompare(b),
  );
