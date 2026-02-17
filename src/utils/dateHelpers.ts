import { Transaction } from '../types';

/**
 * Derives the list of unique years from transactions, always including the current year.
 * Sorted descending (newest first).
 */
export function getAvailableYears(transactions: Transaction[]): number[] {
    const years = Array.from(new Set(transactions.map(t => new Date(t.date).getFullYear())));
    const currentYear = new Date().getFullYear();
    if (!years.includes(currentYear)) {
        years.push(currentYear);
    }
    return years.sort((a, b) => b - a);
}
