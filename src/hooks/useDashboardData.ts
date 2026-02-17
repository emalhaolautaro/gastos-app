import { useMemo } from 'react';
import { Transaction, Category } from '../types';
import { getCategoryName, getCategoryColor } from '../utils/categoryHelpers';

interface DashboardFilters {
    selectedYear: string;
    selectedMonth: string;
}

interface ChartDataPoint {
    name: string;
    value: number;
    color: string;
}



interface TrendDataPoint {
    name: string;
    monthIndex: number;
    Ingresos: number;
    Gastos: number;
}

interface DashboardSummary {
    income: number;
    expenses: number;
    balance: number;
    savingsRate: number;
}

export function useDashboardData(
    transactions: Transaction[],
    categories: Category[],
    filters: DashboardFilters
) {
    const { selectedYear, selectedMonth } = filters;

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = new Date(t.date);
            const yearMatch = date.getFullYear().toString() === selectedYear;
            const monthMatch = selectedMonth === 'all' || (date.getMonth() + 1).toString() === selectedMonth;
            return yearMatch && monthMatch;
        });
    }, [transactions, selectedYear, selectedMonth]);

    const summary: DashboardSummary = useMemo(() => {
        const income = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount_in_ars, 0);
        const expenses = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount_in_ars, 0);
        const balance = income - expenses;
        const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
        return { income, expenses, balance, savingsRate };
    }, [filteredTransactions]);

    const trendData: TrendDataPoint[] = useMemo(() => {
        const months = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(parseInt(selectedYear), i, 1);
            const monthName = d.toLocaleDateString('es-AR', { month: 'short' });
            return { name: monthName, monthIndex: i, Ingresos: 0, Gastos: 0 };
        });

        transactions
            .filter(t => new Date(t.date).getFullYear().toString() === selectedYear)
            .forEach(t => {
                const monthIndex = new Date(t.date).getMonth();
                if (t.type === 'income') months[monthIndex].Ingresos += t.amount_in_ars;
                else months[monthIndex].Gastos += t.amount_in_ars;
            });

        return months;
    }, [transactions, selectedYear]);

    const expensesByCategory: ChartDataPoint[] = useMemo(() => {
        const expenses = filteredTransactions.filter(t => t.type === 'expense');
        const grouped: Record<number, number> = {};

        expenses.forEach(t => {
            if (!grouped[t.category_id]) grouped[t.category_id] = 0;
            grouped[t.category_id] += t.amount_in_ars;
        });

        return Object.entries(grouped)
            .map(([id, amount]) => ({
                name: getCategoryName(categories, Number(id)),
                value: amount,
                color: getCategoryColor(categories, Number(id)),
            }))
            .sort((a, b) => b.value - a.value);
    }, [filteredTransactions, categories]);

    const paretoData = useMemo(() => {
        const total = expensesByCategory.reduce((sum, item) => sum + item.value, 0);
        const count = expensesByCategory.length;
        let accumulated = 0;
        return expensesByCategory.map((item, i) => {
            accumulated += item.value;
            return {
                ...item,
                accumulatedPercentage: total === 0 ? 0 : (accumulated / total) * 100,
                itemPercentage: count === 0 ? 0 : ((i + 1) / count) * 100,
            };
        });
    }, [expensesByCategory]);

    return {
        filteredTransactions,
        summary,
        trendData,
        expensesByCategory,
        paretoData,
    } as const;
}
