import { seedTransactions } from '../data/seedTransactions';
import type { Transaction } from '../types/finance';

const API_DELAY_MS = 700;

let storedTransactions: Transaction[] = [...seedTransactions];

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

export const financeApi = {
  async getTransactions(): Promise<Transaction[]> {
    await wait(API_DELAY_MS);
    return [...storedTransactions];
  },

  async createTransaction(transaction: Transaction): Promise<Transaction> {
    await wait(300);
    storedTransactions = [transaction, ...storedTransactions];
    return transaction;
  },

  async updateTransaction(transaction: Transaction): Promise<Transaction> {
    await wait(300);
    storedTransactions = storedTransactions.map((item) =>
      item.id === transaction.id ? transaction : item,
    );
    return transaction;
  },

  async deleteTransaction(transactionId: string): Promise<void> {
    await wait(300);
    storedTransactions = storedTransactions.filter((item) => item.id !== transactionId);
  },
};
