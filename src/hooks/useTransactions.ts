import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Transaction } from '../types';

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all transactions from the backend
    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            const data = await invoke<Transaction[]>('get_transactions');
            setTransactions(data);
            setError(null);
        } catch (e) {
            setError(String(e));
            console.error('Error fetching transactions:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const addTransaction = useCallback(async (input: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const created = await invoke<Transaction>('add_transaction', { input });
            setTransactions(prev => [created, ...prev]);
            setError(null);
            return created;
        } catch (e) {
            setError(String(e));
            console.error('Error adding transaction:', e);
            throw e;
        }
    }, []);

    const deleteTransaction = useCallback(async (id: number) => {
        try {
            await invoke('delete_transaction', { id });
            setTransactions(prev => prev.filter(t => t.id !== id));
            setError(null);
        } catch (e) {
            setError(String(e));
            console.error('Error deleting transaction:', e);
            throw e;
        }
    }, []);

    return {
        transactions,
        loading,
        error,
        addTransaction,
        deleteTransaction,
        refetch: fetchTransactions,
    } as const;
}
