export type TransactionType = 'income' | 'expense';
export type TransactionCurrency = 'ARS' | 'USD';

export interface Transaction {
  id: string;
  description: string;
  amount: number; // Monto en la moneda original
  amountInARS: number; // Monto convertido a ARS
  currency: TransactionCurrency;
  exchangeRate?: number; // Cotización si es USD
  type: TransactionType;
  category: string;
  date: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}
