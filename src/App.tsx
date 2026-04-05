import { lazy, Suspense, useEffect } from 'react';
import { useAppState } from './state/useAppState';
import styles from './App.module.css';

const Overview = lazy(() =>
  import('./features/dashboard/Overview').then((module) => ({ default: module.Overview })),
);

const InsightsPanel = lazy(() =>
  import('./features/insights/InsightsPanel').then((module) => ({
    default: module.InsightsPanel,
  })),
);

const TransactionsPanel = lazy(() =>
  import('./features/transactions/TransactionsPanel').then((module) => ({
    default: module.TransactionsPanel,
  })),
);

function App() {
  const { state, loadTransactions, setRole, setTheme } = useAppState();

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return (
    <div className={styles.app}>
      <main className={styles.container}>
        <section className={styles.topBar}>
          <div className={styles.brand}>
            <h1>Zorvyn Finance Dashboard</h1>
            <p>Track balance, inspect spending patterns, and manage transactions.</p>
          </div>

          <div className={styles.controls}>
            <div className={styles.roleControl}>
              <span className={styles.roleText}>Role</span>
              <div className={styles.roleSwitch} role="radiogroup" aria-label="Select role">
                <button
                  type="button"
                  role="radio"
                  aria-checked={state.role === 'viewer'}
                  className={`${styles.roleOption} ${state.role === 'viewer' ? styles.roleOptionActive : ''}`}
                  onClick={() => setRole('viewer')}
                >
                  Viewer
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={state.role === 'admin'}
                  className={`${styles.roleOption} ${state.role === 'admin' ? styles.roleOptionActive : ''}`}
                  onClick={() => setRole('admin')}
                >
                  Admin
                </button>
              </div>
            </div>

            <div className={styles.themeControl}>
              <span className={`${styles.themeText} ${state.theme === 'dark' ? styles.activeText : ''}`}>
                DARK
              </span>
              <button
                type="button"
                className={`${styles.themeSwitch} ${state.theme === 'dark' ? styles.isDark : ''}`}
                onClick={() => setTheme(state.theme === 'light' ? 'dark' : 'light')}
                role="switch"
                aria-checked={state.theme === 'dark'}
                aria-label="Toggle theme"
              >
                <span className={styles.switchThumb}>
                  <span className={styles.switchMoon} />
                </span>
              </button>
              <span className={`${styles.themeText} ${state.theme === 'light' ? styles.activeText : ''}`}>
                LIGHT
              </span>
            </div>
          </div>
        </section>

        {state.loading ? (
          <section className={styles.status}>Loading transaction data...</section>
        ) : state.error ? (
          <section className={styles.status}>
            {state.error}
            <div className={styles.errorActions}>
              <button type="button" onClick={loadTransactions}>
                Retry
              </button>
            </div>
          </section>
        ) : (
          <Suspense fallback={<section className={styles.status}>Loading dashboard modules...</section>}>
            <Overview />
            <InsightsPanel />
            <TransactionsPanel />
          </Suspense>
        )}
      </main>
    </div>
  );
}

export default App;
