import { useState } from 'react';
import { Check } from 'lucide-react';
import { Category, Transaction } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { DynamicIcon } from '../ui/DynamicIcon';
import { ConfirmDialog, useConfirmDialog } from '../ui/ConfirmDialog';
import { AVAILABLE_ICONS } from '../../data/icons';
import { CATEGORY_COLORS } from '../../data/colors';

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
                    <div key={category.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div
                                className="p-2 rounded-full flex items-center justify-center h-10 w-10"
                                style={{ backgroundColor: `${category.color}20`, color: category.color }}
                            >
                                <DynamicIcon name={category.icon} className="h-5 w-5" />
                            </div>
                            <span className="font-bold">{category.name}</span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(category)}>
                                <Edit2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
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
                <Button onClick={() => handleOpenDialog()} className="bg-[#fce4ec] text-pink-900 hover:bg-[#fce4ec]/90 shadow-md font-bold border border-pink-200">
                    <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {renderCategoryList('expense', 'Categorías de Gastos')}
                {renderCategoryList('income', 'Categorías de Ingresos')}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl w-[90vw] max-h-[85vh] overflow-y-auto bg-[#ffe4e6] border-pink-200">
                    <DialogHeader>
                        <DialogTitle className="font-bold text-xl">{editingId !== null ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <div className="flex p-1 bg-input-background rounded-lg border border-orange-100">
                                <button
                                    type="button"
                                    className={cn("flex-1 py-2 rounded-md transition-all", type === 'expense' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
                                    onClick={() => setType('expense')}
                                >
                                    Gasto
                                </button>
                                <button
                                    type="button"
                                    className={cn("flex-1 py-2 rounded-md transition-all", type === 'income' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
                                    onClick={() => setType('income')}
                                >
                                    Ingreso
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre de la categoría</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Gimnasio, Cafetería, etc." className="bg-input-background border-orange-100 placeholder:text-gray-400" />
                        </div>

                        <div className="space-y-2">
                            <Label>Icono</Label>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-3 border border-orange-100 rounded-md bg-input-background h-[160px] overflow-y-auto">
                                {AVAILABLE_ICONS.map(iconName => (
                                    <button
                                        key={iconName}
                                        onClick={() => setIcon(iconName)}
                                        className={cn(
                                            "p-2 rounded-md hover:bg-white/60 transition-colors flex items-center justify-center",
                                            icon === iconName ? "bg-black text-white shadow-sm scale-110" : "text-gray-700"
                                        )}
                                        title={iconName}
                                        type="button"
                                    >
                                        <DynamicIcon name={iconName} className="h-5 w-5" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                                {CATEGORY_COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        className={cn(
                                            "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center",
                                            color === c ? "border-foreground scale-110 shadow-md" : "border-transparent"
                                        )}
                                        style={{ backgroundColor: c }}
                                        type="button"
                                    >
                                        {color === c && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-transparent border-black/20 hover:bg-black/5">Cancelar</Button>
                        <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800 shadow-md">
                            {editingId !== null ? 'Guardar Cambios' : 'Crear Categoría'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Dialog for delete actions */}
            <ConfirmDialog {...dialogProps} />
        </div>
    );
}
