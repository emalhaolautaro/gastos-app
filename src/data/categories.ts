import { Category } from '../types';

export const defaultCategories: Category[] = [
    // Expenses
    { id: '1', name: 'Alimentación', type: 'expense', icon: 'Utensils', color: '#f87171' },
    { id: '2', name: 'Transporte', type: 'expense', icon: 'Car', color: '#fb923c' },
    { id: '3', name: 'Vivienda', type: 'expense', icon: 'Home', color: '#facc15' },
    { id: '4', name: 'Servicios', type: 'expense', icon: 'Zap', color: '#a3e635' },
    { id: '5', name: 'Entretenimiento', type: 'expense', icon: 'Gamepad2', color: '#22d3ee' },
    { id: '6', name: 'Salud', type: 'expense', icon: 'Heart', color: '#f472b6' },
    { id: '7', name: 'Educación', type: 'expense', icon: 'GraduationCap', color: '#818cf8' },
    { id: '8', name: 'Compras', type: 'expense', icon: 'ShoppingBag', color: '#2dd4bf' },
    { id: '9', name: 'Otros', type: 'expense', icon: 'MoreHorizontal', color: '#9ca3af' },

    // Income
    { id: '10', name: 'Salario', type: 'income', icon: 'Briefcase', color: '#4ade80' },
    { id: '11', name: 'Freelance', type: 'income', icon: 'Laptop', color: '#34d399' },
    { id: '12', name: 'Inversiones', type: 'income', icon: 'TrendingUp', color: '#60a5fa' },
    { id: '13', name: 'Regalo', type: 'income', icon: 'Gift', color: '#c084fc' },
    { id: '14', name: 'Otros Ingresos', type: 'income', icon: 'Plus', color: '#94a3b8' },
];
