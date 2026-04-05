import type { Transaction } from '../types/finance';

const download = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const exportTransactionsAsJSON = (transactions: Transaction[]) => {
  const content = JSON.stringify(transactions, null, 2);
  download('transactions-export.json', content, 'application/json');
};

export const exportTransactionsAsCSV = (transactions: Transaction[]) => {
  const header = ['id', 'date', 'description', 'amount', 'category', 'type'];

  const rows = transactions.map((transaction) =>
    [
      transaction.id,
      transaction.date,
      transaction.description,
      transaction.amount.toString(),
      transaction.category,
      transaction.type,
    ]
      .map((field) => `"${field.replace(/"/g, '""')}"`)
      .join(','),
  );

  const content = [header.join(','), ...rows].join('\n');
  download('transactions-export.csv', content, 'text/csv;charset=utf-8');
};
