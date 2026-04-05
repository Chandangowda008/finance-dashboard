import { useMemo } from 'react';
import { useAppState } from '../../state/useAppState';
import { getInsights } from '../../utils/finance';
import styles from './InsightsPanel.module.css';

export const InsightsPanel = () => {
  const { filteredTransactions } = useAppState();
  const insights = useMemo(() => getInsights(filteredTransactions), [filteredTransactions]);
  const hasData = filteredTransactions.length > 0;

  return (
    <section className={styles.section}>
      <header>
        <h3>Insights</h3>
        <p>Quick signals from your latest data.</p>
      </header>
      {hasData ? (
        <div className={styles.grid}>
          {insights.map((insight) => (
            <article className={styles.item} key={insight.title}>
              <h4>{insight.title}</h4>
              <p className={styles.value}>{insight.value}</p>
              <small>{insight.helperText}</small>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>No data to generate insights yet.</div>
      )}
    </section>
  );
};
