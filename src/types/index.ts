export type Currency = 'ARS' | 'USD';

export type TransactionType = 'income' | 'expense';

export interface Category {
    id: string;
    name: string;
    type: TransactionType;
    icon: string; // lucide-react icon name
    color: string;
    isDefault?: boolean;
}

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    amountInARS: number;
    currency: Currency;
    exchangeRate?: number; // Required if currency is USD
    categoryId: string;
    date: string; // ISO string
    type: TransactionType;
}

export interface DashboardStats {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
    savingsRate: number;
}
