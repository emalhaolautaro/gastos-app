import { useState } from 'react';
import { Category, Transaction } from '../../../types';
import { Button } from '../../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Plus } from 'lucide-react';
import { ConfirmDialog, useConfirmDialog } from '../../ui/ConfirmDialog';
import { CategoryCard } from './CategoryCard';
import { CategoryFormDialog } from './CategoryFormDialog';

interface CategoryManagerProps {
    categories: Category[];
    transactions: Transaction[];
    onAddCategory: (category: Omit<Category, 'id' | 'is_default'>) => void;
    onUpdateCategory: (id: number, updates: Partial<Omit<Category, 'id' | 'is_default'>>) => void;
    onDeleteCategory: (id: number) => void;
}

export function CategoryManager({
    categories,
    transactions,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
}: CategoryManagerProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { confirm, dialogProps } = useConfirmDialog();

    // Form State
    const [name, setName] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [icon, setIcon] = useState('MoreHorizontal');
    const [color, setColor] = useState('#9ca3af');

    const resetForm = () => {
        setName('');
        setType('expense');
        setIcon('MoreHorizontal');
        setColor('#9ca3af');
        setEditingId(null);
    };

    const handleOpenDialog = (category?: Category) => {
        if (category) {
            setName(category.name);
            setType(category.type);
            setIcon(category.icon);
            setColor(category.color);
            setEditingId(category.id);
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!name.trim()) return;

        if (editingId !== null) {
            onUpdateCategory(editingId, { name, type, icon, color });
        } else {
            onAddCategory({ name, type, icon, color });
        }
        setIsDialogOpen(false);
        resetForm();
    };

    const handleDelete = (id: number) => {
        const hasTransactions = transactions.some(t => t.category_id === id);
        if (hasTransactions) {
            confirm({
                title: 'No se puede eliminar',
                description: 'Esta categoría tiene transacciones asociadas. Eliminá o reasigná las transacciones primero.',
                confirmLabel: 'Entendido',
                onConfirm: () => { },
            });
            return;
        }
        confirm({
            title: 'Eliminar categoría',
            description: '¿Estás seguro de que querés eliminar esta categoría?',
            confirmLabel: 'Eliminar',
            variant: 'destructive',
            onConfirm: () => onDeleteCategory(id),
        });
    };

    const renderCategoryList = (listType: 'income' | 'expense', title: string) => (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {categories.filter(c => c.type === listType).map(category => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        onEdit={handleOpenDialog}
                        onDelete={handleDelete}
                    />
                ))}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-card p-6 rounded-lg shadow-sm border">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Categorías</h2>
                    <p className="text-muted-foreground font-medium">Personaliza tus categorías de ingresos y gastos</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-black/90 hover:bg-black text-white shadow-md font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {renderCategoryList('expense', 'Categorías de Gastos')}
                {renderCategoryList('income', 'Categorías de Ingresos')}
            </div>

            <CategoryFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                editingId={editingId}
                name={name}
                onNameChange={setName}
                type={type}
                onTypeChange={setType}
                icon={icon}
                onIconChange={setIcon}
                color={color}
                onColorChange={setColor}
                onSave={handleSave}
            />

            <ConfirmDialog {...dialogProps} />
        </div>
    );
}
