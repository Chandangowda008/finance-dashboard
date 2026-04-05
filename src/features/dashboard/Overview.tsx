import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMemo } from 'react';
import { useAppState } from '../../state/useAppState';
import { formatCurrency, getCategoryBreakdown, getMonthlyTrend, getSummary } from '../../utils/finance';
import styles from './Overview.module.css';

const PIE_COLORS = ['#0958d9', '#0f766e', '#b45309', '#be123c', '#7c3aed', '#4f46e5'];

export const Overview = () => {
  const { state, filteredTransactions } = useAppState();

  const summary = useMemo(() => getSummary(filteredTransactions), [filteredTransactions]);
  const trendData = useMemo(() => getMonthlyTrend(state.transactions), [state.transactions]);
  const categoryData = useMemo(
    () => getCategoryBreakdown(filteredTransactions),
    [filteredTransactions],
  );

  return (
    <section className={styles.section}>
      {state.transactions.length === 0 ? (
        <div className={styles.noDataNotice}>
          No transactions yet. Summary cards show zero until data is added.
        </div>
      ) : null}

      <div className={styles.cardGrid}>
        <article className={styles.summaryCard}>
          <p>Total Balance</p>
          <h3>{formatCurrency(summary.balance)}</h3>
        </article>
        <article className={styles.summaryCard}>
          <p>Income</p>
          <h3>{formatCurrency(summary.income)}</h3>
        </article>
        <article className={styles.summaryCard}>
          <p>Expenses</p>
          <h3>{formatCurrency(summary.expenses)}</h3>
        </article>
      </div>

      <div className={styles.chartGrid}>
        <article className={styles.chartCard}>
          <header>
            <h4>Balance Trend</h4>
            <p>Time-based view</p>
          </header>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--chart-grid)" />
                <XAxis dataKey="month" stroke="var(--muted-text)" />
                <YAxis stroke="var(--muted-text)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="var(--accent)"
                  fill="url(#balanceGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.empty}>No trend data yet.</p>
          )}
        </article>

        <article className={styles.chartCard}>
          <header>
            <h4>Spending Breakdown</h4>
            <p>Category-based view</p>
          </header>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                  }}
                />
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="category"
                  innerRadius={64}
                  outerRadius={96}
                  paddingAngle={3}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`slice-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.empty}>No expense categories available.</p>
          )}
        </article>
      </div>
    </section>
  );
};
