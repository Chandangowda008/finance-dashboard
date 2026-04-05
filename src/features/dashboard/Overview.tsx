import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  type PieLabelRenderProps,
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

const RADIAN = Math.PI / 180;

const renderPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: PieLabelRenderProps) => {
  if (
    cx == null ||
    cy == null ||
    midAngle == null ||
    innerRadius == null ||
    outerRadius == null ||
    percent == null ||
    percent < 0.08
  ) {
    return null;
  }

  const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.52;
  const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
  const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

export const Overview = () => {
  const { state, filteredTransactions } = useAppState();

  const summary = useMemo(() => getSummary(filteredTransactions), [filteredTransactions]);
  const trendData = useMemo(() => getMonthlyTrend(state.transactions), [state.transactions]);
  const categoryData = useMemo(
    () => getCategoryBreakdown(filteredTransactions),
    [filteredTransactions],
  );
  const expenseTotal = useMemo(
    () => categoryData.reduce((sum, item) => sum + item.value, 0),
    [categoryData],
  );
  const pieData = useMemo(
    () =>
      categoryData.map((item) => ({
        ...item,
        share: expenseTotal > 0 ? item.value / expenseTotal : 0,
      })),
    [categoryData, expenseTotal],
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
            <>
              <div className={styles.pieWrap}>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                      }}
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="category"
                      innerRadius={70}
                      outerRadius={102}
                      paddingAngle={4}
                      cornerRadius={8}
                      stroke="var(--surface)"
                      strokeWidth={3}
                      labelLine={false}
                      label={renderPieLabel}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`slice-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.pieCenter}>
                  <span>Total Spend</span>
                  <strong>{formatCurrency(expenseTotal)}</strong>
                </div>
              </div>

              <ul className={styles.pieLegend}>
                {pieData.map((item, index) => (
                  <li key={item.category}>
                    <span
                      className={styles.legendSwatch}
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className={styles.legendName}>{item.category}</span>
                    <span className={styles.legendValue}>{Math.round(item.share * 100)}%</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className={styles.empty}>No expense categories available.</p>
          )}
        </article>
      </div>
    </section>
  );
};
