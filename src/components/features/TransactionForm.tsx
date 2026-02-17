import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Category, Transaction } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';
import { formatCurrency, cn } from '../../lib/utils';
import { Plus } from 'lucide-react';
import { DynamicIcon } from '../ui/DynamicIcon';
import { DatePickerField } from '../ui/DatePickerField';

const transactionSchema = z.object({
    description: z.string().min(1, 'La descripción es obligatoria'),
    amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
    currency: z.enum(['ARS', 'USD']),
    exchangeRate: z.number().optional(),
    categoryId: z.number().min(1, 'Debes seleccionar una categoría'),
    date: z.date(),
    type: z.enum(['income', 'expense']),
}).refine((data) => {
    if (data.currency === 'USD') {
        return data.exchangeRate && data.exchangeRate > 0;
    }
    return true;
}, {
    message: "La cotización es obligatoria para transacciones en USD",
    path: ["exchangeRate"],
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
    onAddTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => void;
    categories: Category[];
}

export function TransactionForm({ onAddTransaction, categories }: TransactionFormProps) {
    const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');

    const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: 'expense',
            currency: 'ARS',
            date: new Date(),
            amount: 0,
        }
    });

    const currency = watch('currency');
    const amount = watch('amount');
    const exchangeRate = watch('exchangeRate');
    const date = watch('date');
    const selectedCategoryId = watch('categoryId');

    const filteredCategories = categories.filter(c => c.type === selectedType);
    const selectedCategory = categories.find(c => c.id === selectedCategoryId);

    const onSubmit = (data: TransactionFormValues) => {
        const amountInARS = data.currency === 'USD'
            ? (data.amount * (data.exchangeRate || 1))
            : data.amount;

        // Map internal camelCase form values → snake_case for the backend
        onAddTransaction({
            description: data.description,
            amount: data.amount,
            amount_in_ars: amountInARS,
            currency: data.currency,
            exchange_rate: data.exchangeRate ?? null,
            category_id: data.categoryId,
            date: data.date.toISOString(),
            type: data.type,
        });

        reset({
            type: selectedType,
            currency: 'ARS',
            date: new Date(),
            amount: 0,
            description: '',
            categoryId: undefined,
            exchangeRate: undefined,
        });
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setValue('amount', isNaN(val) ? 0 : val);
    };

    const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setValue('exchangeRate', isNaN(val) ? 0 : val);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-sm border bg-card">
            <div className="p-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Nueva Transacción</h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Type Selector */}
                    <div className="flex p-1 bg-muted/50 rounded-lg border">
                        <button
                            type="button"
                            className={cn(
                                "flex-1 py-2 rounded-md transition-all",
                                selectedType === 'expense'
                                    ? "bg-background text-foreground shadow-sm border border-pink-200"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => {
                                setSelectedType('expense');
                                setValue('type', 'expense');
                            }}
                        >
                            Gasto
                        </button>
                        <button
                            type="button"
                            className={cn(
                                "flex-1 py-2 rounded-md transition-all",
                                selectedType === 'income'
                                    ? "bg-background text-foreground shadow-sm border border-pink-200"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => {
                                setSelectedType('income');
                                setValue('type', 'income');
                            }}
                        >
                            Ingreso
                        </button>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input
                            id="description"
                            placeholder="Ej: Supermercado"
                            {...register('description')}
                            className="bg-input-background border-input placeholder:text-muted-foreground"
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">Monto</Label>
                            <div className="relative">
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    onChange={handleAmountChange}
                                    className="bg-input-background border-input pr-16 font-bold"
                                />
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground font-bold">
                                    {currency}
                                </div>
                            </div>
                            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
                        </div>

                        {/* Currency */}
                        <div className="space-y-2">
                            <Label htmlFor="currency">Moneda</Label>
                            <Select onValueChange={(val: 'ARS' | 'USD') => setValue('currency', val)} defaultValue="ARS">
                                <SelectTrigger className="bg-input-background border-input font-bold">
                                    <SelectValue placeholder="Selecciona moneda" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ARS">🇦🇷 ARS (Pesos)</SelectItem>
                                    <SelectItem value="USD">🇺🇸 USD (Dólares)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Exchange Rate (Conditional) */}
                    {currency === 'USD' && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md space-y-4 animate-in fade-in zoom-in-95">
                            <div className="space-y-2">
                                <Label htmlFor="exchangeRate" className="text-amber-700 font-bold">Cotización del Dólar (ARS)</Label>
                                <Input
                                    id="exchangeRate"
                                    type="number"
                                    step="0.01"
                                    placeholder="Ej: 1100"
                                    onChange={handleRateChange}
                                    className="bg-white border-amber-200"
                                />
                                {errors.exchangeRate && <p className="text-sm text-red-500">{errors.exchangeRate.message}</p>}
                            </div>
                            {amount > 0 && exchangeRate && exchangeRate > 0 && (
                                <div className="text-sm text-amber-700 font-bold flex justify-between">
                                    <span>Conversión estimada:</span>
                                    <span>{formatCurrency(amount * exchangeRate, 'ARS')}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Select onValueChange={(val) => setValue('categoryId', Number(val))}>
                            <SelectTrigger className="bg-input-background border-input h-12">
                                <div className="flex items-center gap-2">
                                    {selectedCategory ? (
                                        <>
                                            <div className="p-1.5 rounded-full bg-black/5" style={{ color: selectedCategory.color }}>
                                                <DynamicIcon name={selectedCategory.icon} className="h-4 w-4" />
                                            </div>
                                            <span className="font-bold">{selectedCategory.name}</span>
                                        </>
                                    ) : <span className="text-muted-foreground font-normal">Selecciona una categoría</span>}
                                </div>
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {filteredCategories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="p-1.5 rounded-full bg-black/5 flex items-center justify-center"
                                                style={{ color: cat.color }}
                                            >
                                                <DynamicIcon name={cat.icon} className="h-4 w-4" />
                                            </div>
                                            <span className="font-semibold">{cat.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
                    </div>

                    {/* Date Picker */}
                    <div className="space-y-2 flex flex-col">
                        <DatePickerField
                            value={date}
                            onChange={(d) => setValue('date', d)}
                        />
                        {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
                    </div>

                    <Button type="submit" className="w-full bg-black/90 hover:bg-black text-white font-bold py-6 text-xl shadow-md transition-all mt-6">
                        <Plus className="mr-2 h-5 w-5" /> Agregar Transacción
                    </Button>

                </form>
            </div>
        </Card>
    );
}
