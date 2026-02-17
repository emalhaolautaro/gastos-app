export type Currency = 'ARS' | 'USD';

export type TransactionType = 'income' | 'expense';

export interface Category {
    id: number;
    name: string;
    type: TransactionType;
    icon: string; // lucide-react icon name
    color: string;
    is_default: boolean;
}

export interface Transaction {
    id: number;
    description: string;
    amount: number;
    amount_in_ars: number;
    currency: Currency;
    exchange_rate: number | null;
    category_id: number;
    date: string; // ISO 8601 string
    type: TransactionType;
    created_at: string; // ISO 8601 string
    updated_at: string; // ISO 8601 string
}

export interface DashboardStats {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
    savingsRate: number;
}
