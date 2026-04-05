import { seedTransactions } from '../data/seedTransactions';
import type { Transaction } from '../types/finance';

const API_DELAY_MS = 700;
const API_BASE_URL = import.meta.env.VITE_FINANCE_API_BASE_URL ?? 'https://postman-echo.com';
const API_KEY = import.meta.env.VITE_FINANCE_API_KEY ?? 'demo-finance-key';

let storedTransactions: Transaction[] = [...seedTransactions];

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface MockApiLogEntry {
  timestamp: string;
  phase: 'request' | 'response';
  method: HttpMethod;
  url: string;
  status?: number;
  payload?: unknown;
  data?: unknown;
}

interface ApiEnvelope<TData> {
  status: number;
  data: TData;
}

interface RequestConfig<TPayload> {
  method: HttpMethod;
  path: string;
  payload?: TPayload;
  delayMs?: number;
}

const callRemoteApi = async <TPayload>(
  method: HttpMethod,
  path: string,
  payload?: TPayload,
) => {
  const methodEndpoint = method.toLowerCase();
  const endpointUrl = new URL(`${API_BASE_URL}/${methodEndpoint}`);

  if (method === 'GET') {
    endpointUrl.searchParams.set('path', path);
  }

  const headers: Record<string, string> = {
    'x-api-key': API_KEY,
    Authorization: `Bearer ${API_KEY}`,
  };

  const init: RequestInit = {
    method,
    headers,
  };

  if (method !== 'GET') {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify({
      path,
      payload: payload ?? null,
    });
  }

  try {
    const response = await fetch(endpointUrl.toString(), init);
    const text = await response.text();

    return {
      status: response.status,
      responseBody: text,
    };
  } catch (error) {
    return {
      status: 0,
      responseBody: String(error),
    };
  }
};

const pushMockApiLog = (entry: MockApiLogEntry) => {
  if (typeof window === 'undefined') {
    return;
  }

  const globalWindow = window as Window & {
    __mockApiLogs?: MockApiLogEntry[];
  };

  globalWindow.__mockApiLogs = globalWindow.__mockApiLogs ?? [];
  globalWindow.__mockApiLogs.push(entry);
};

const mockRequest = async <TData, TPayload = undefined>(
  config: RequestConfig<TPayload>,
  resolver: () => TData,
): Promise<ApiEnvelope<TData>> => {
  const { method, path, payload, delayMs = API_DELAY_MS } = config;
  const url = `${API_BASE_URL}${path}`;

  const requestEntry: MockApiLogEntry = {
    timestamp: new Date().toISOString(),
    phase: 'request',
    method,
    url,
    payload: payload ?? null,
  };

  pushMockApiLog(requestEntry);
  console.log('[Mock API request]', requestEntry);

  const networkResult = await callRemoteApi(method, path, payload);
  await wait(delayMs);

  const data = resolver();

  const responseEntry: MockApiLogEntry = {
    timestamp: new Date().toISOString(),
    phase: 'response',
    method,
    url,
    status: networkResult.status || 200,
    data: {
      localData: data,
      remoteEcho: networkResult.responseBody,
    },
  };

  pushMockApiLog(responseEntry);
  console.log('[Mock API response]', responseEntry);

  return {
    status: networkResult.status || 200,
    data,
  };
};

export const financeApi = {
  async getTransactions(): Promise<Transaction[]> {
    const response = await mockRequest<Transaction[]>({ method: 'GET', path: '/transactions' }, () => [
      ...storedTransactions,
    ]);

    return response.data;
  },

  async createTransaction(transaction: Transaction): Promise<Transaction> {
    const response = await mockRequest<Transaction, Transaction>(
      {
        method: 'POST',
        path: '/transactions',
        payload: transaction,
        delayMs: 300,
      },
      () => {
        storedTransactions = [transaction, ...storedTransactions];
        return transaction;
      },
    );

    return response.data;
  },

  async updateTransaction(transaction: Transaction): Promise<Transaction> {
    const response = await mockRequest<Transaction, Transaction>(
      {
        method: 'PUT',
        path: `/transactions/${transaction.id}`,
        payload: transaction,
        delayMs: 300,
      },
      () => {
        storedTransactions = storedTransactions.map((item) =>
          item.id === transaction.id ? transaction : item,
        );

        return transaction;
      },
    );

    return response.data;
  },

  async deleteTransaction(transactionId: string): Promise<void> {
    await mockRequest<null, { id: string }>(
      {
        method: 'DELETE',
        path: `/transactions/${transactionId}`,
        payload: { id: transactionId },
        delayMs: 300,
      },
      () => {
        storedTransactions = storedTransactions.filter((item) => item.id !== transactionId);
        return null;
      },
    );
  },
};
