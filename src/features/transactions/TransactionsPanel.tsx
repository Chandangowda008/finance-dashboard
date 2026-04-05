import { useMemo, useState } from 'react';
import { useAppState } from '../../state/useAppState';
import type { Transaction } from '../../types/finance';
import { exportTransactionsAsCSV, exportTransactionsAsJSON } from '../../utils/exporters';
import { formatCurrency, formatDate } from '../../utils/finance';
import { TransactionModal } from './TransactionModal';
import styles from './TransactionsPanel.module.css';

export const TransactionsPanel = () => {
  const {
    state,
    filteredTransactions,
    categories,
    setFilter,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useAppState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);

  const canMutate = state.role === 'admin';
  const roleLabel = canMutate ? 'Admin Mode' : 'Viewer Mode';

  const emptyMessage = useMemo(() => {
    if (state.transactions.length === 0) {
      return 'No transactions found. Add a transaction to get started.';
    }

    if (filteredTransactions.length === 0) {
      return 'No transactions match your current filters.';
    }

    return null;
  }, [state.transactions.length, filteredTransactions.length]);

  const openCreateModal = () => {
    setEditingTransaction(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingTransaction(undefined);
    setIsModalOpen(false);
  };

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h3>Transactions</h3>
          <p>
            {canMutate
              ? 'Search, sort, filter, and edit your records.'
              : 'Read-only mode. You can explore, filter, and export records.'}
          </p>
        </div>
        <div className={styles.actions}>
          <span className={`${styles.roleBadge} ${canMutate ? styles.adminBadge : styles.viewerBadge}`}>
            {roleLabel}
          </span>
          <button type="button" onClick={() => exportTransactionsAsCSV(filteredTransactions)}>
            Export CSV
          </button>
          <button type="button" onClick={() => exportTransactionsAsJSON(filteredTransactions)}>
            Export JSON
          </button>
          {canMutate ? (
            <button type="button" className={styles.addButton} onClick={openCreateModal}>
              Add Transaction
            </button>
          ) : null}
        </div>
      </header>

      {!canMutate ? (
        <div className={styles.permissionNote}>
          Viewer role cannot add or edit transactions. Switch to Admin for write actions.
        </div>
      ) : null}

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="Search description or category"
          value={state.filters.search}
          onChange={(event) => setFilter({ search: event.target.value })}
        />

        <select
          value={state.filters.type}
          onChange={(event) => setFilter({ type: event.target.value as typeof state.filters.type })}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={state.filters.category}
          onChange={(event) =>
            setFilter({ category: event.target.value as typeof state.filters.category })
          }
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={state.filters.sortBy}
          onChange={(event) =>
            setFilter({ sortBy: event.target.value as typeof state.filters.sortBy })
          }
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>

      {emptyMessage ? (
        <div className={styles.empty}>{emptyMessage}</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                {canMutate ? <th>Action</th> : null}
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td data-label="Date">{formatDate(transaction.date)}</td>
                  <td data-label="Description">{transaction.description}</td>
                  <td data-label="Category">{transaction.category}</td>
                  <td data-label="Type">
                    <span className={transaction.type === 'income' ? styles.income : styles.expense}>
                      {transaction.type}
                    </span>
                  </td>
                  <td data-label="Amount">{formatCurrency(transaction.amount)}</td>
                  {canMutate ? (
                    <td data-label="Action">
                      <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => openEditModal(transaction)}
                      >
                        Edit
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TransactionModal
        key={editingTransaction?.id ?? 'new-transaction'}
        open={isModalOpen}
        onClose={closeModal}
        transaction={editingTransaction}
        onSubmit={editingTransaction ? updateTransaction : addTransaction}
        onDelete={editingTransaction ? deleteTransaction : undefined}
      />
    </section>
  );
};
