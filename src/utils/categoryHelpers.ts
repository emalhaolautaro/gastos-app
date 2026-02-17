import { Category } from '../types';

export function getCategoryName(categories: Category[], id: number): string {
    return categories.find(c => c.id === id)?.name ?? 'Desconocido';
}

export function getCategoryColor(categories: Category[], id: number): string {
    return categories.find(c => c.id === id)?.color ?? '#9ca3af';
}

export function getCategoryById(categories: Category[], id: number): Category | undefined {
    return categories.find(c => c.id === id);
}
