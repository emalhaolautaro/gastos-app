import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Category } from '../types';

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all categories from the backend
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const data = await invoke<Category[]>('get_categories');
            setCategories(data);
            setError(null);
        } catch (e) {
            setError(String(e));
            console.error('Error fetching categories:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const addCategory = useCallback(async (input: Omit<Category, 'id' | 'is_default'>) => {
        try {
            const created = await invoke<Category>('add_category', { input });
            setCategories(prev => [...prev, created]);
            setError(null);
            return created;
        } catch (e) {
            setError(String(e));
            console.error('Error adding category:', e);
            throw e;
        }
    }, []);

    const updateCategory = useCallback(async (id: number, updates: Partial<Omit<Category, 'id' | 'is_default'>>) => {
        // We need to send the full updates object to the backend
        try {
            const updated = await invoke<Category>('update_category', { id, updates });
            setCategories(prev => prev.map(c => c.id === id ? updated : c));
            setError(null);
            return updated;
        } catch (e) {
            setError(String(e));
            console.error('Error updating category:', e);
            throw e;
        }
    }, []);

    const deleteCategory = useCallback(async (id: number) => {
        try {
            await invoke('delete_category', { id });
            setCategories(prev => prev.filter(c => c.id !== id));
            setError(null);
        } catch (e) {
            setError(String(e));
            console.error('Error deleting category:', e);
            throw e;
        }
    }, []);

    return {
        categories,
        loading,
        error,
        addCategory,
        updateCategory,
        deleteCategory,
        refetch: fetchCategories,
    } as const;
}
