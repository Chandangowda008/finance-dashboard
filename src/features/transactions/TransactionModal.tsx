import { useState } from 'react';
import type { Transaction, TransactionType } from '../../types/finance';
import styles from './TransactionModal.module.css';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (transaction: Transaction) => Promise<void>;
  transaction?: Transaction;
}

interface FormState {
  date: string;
  description: string;
  amount: string;
  category: string;
  type: TransactionType;
}

const initialFormState: FormState = {
  date: '',
  description: '',
  amount: '',
  category: '',
  type: 'expense',
};

const buildInitialFormState = (transaction?: Transaction): FormState => {
  if (!transaction) {
    return initialFormState;
  }

  return {
    date: transaction.date,
    description: transaction.description,
    amount: transaction.amount.toString(),
    category: transaction.category,
    type: transaction.type,
  };
};

export const TransactionModal = ({
  open,
  onClose,
  onSubmit,
  transaction,
}: TransactionModalProps) => {
  const [form, setForm] = useState<FormState>(() => buildInitialFormState(transaction));
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return null;
  }

  const isValid =
    form.date.trim().length > 0 &&
    form.description.trim().length > 0 &&
    form.category.trim().length > 0 &&
    Number(form.amount) > 0;

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValid || submitting) {
      return;
    }

    setSubmitting(true);
    const payload: Transaction = {
      id: transaction?.id ?? `tx-${Date.now()}`,
      date: form.date,
      description: form.description.trim(),
      amount: Number(form.amount),
      category: form.category.trim(),
      type: form.type,
    };

    await onSubmit(payload);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <form className={styles.modal} onSubmit={handleSubmit}>
        <header>
          <h3>{transaction ? 'Edit Transaction' : 'Add Transaction'}</h3>
          <p>Admin-only action for this demo.</p>
        </header>

        <label>
          Date
          <input
            type="date"
            value={form.date}
            onChange={(event) => handleChange('date', event.target.value)}
            required
          />
        </label>

        <label>
          Description
          <input
            type="text"
            value={form.description}
            onChange={(event) => handleChange('description', event.target.value)}
            placeholder="e.g. Grocery run"
            required
          />
        </label>

        <div className={styles.row}>
          <label>
            Amount
            <input
              type="number"
              min="1"
              value={form.amount}
              onChange={(event) => handleChange('amount', event.target.value)}
              required
            />
          </label>

          <label>
            Type
            <select
              value={form.type}
              onChange={(event) => handleChange('type', event.target.value)}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>
        </div>

        <label>
          Category
          <input
            type="text"
            value={form.category}
            onChange={(event) => handleChange('category', event.target.value)}
            placeholder="e.g. Food"
            required
          />
        </label>

        <footer className={styles.actions}>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={!isValid || submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </footer>
      </form>
    </div>
  );
};
