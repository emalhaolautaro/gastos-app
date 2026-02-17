import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Category, Transaction } from '../../../types';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card } from '../../ui/card';

import { Plus } from 'lucide-react';
import { TypeSelector } from '../shared/TypeSelector';
import { CategorySelect } from '../shared/CategorySelect';
import { ExchangeRateField } from '../shared/ExchangeRateField';
import { DatePickerField } from '../../ui/DatePickerField';

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

    const onSubmit = (data: TransactionFormValues) => {
        const amountInARS = data.currency === 'USD'
            ? (data.amount * (data.exchangeRate || 1))
            : data.amount;

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

    const handleTypeChange = (type: 'income' | 'expense') => {
        setSelectedType(type);
        setValue('type', type);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-sm border bg-card">
            <div className="p-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Nueva Transacción</h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    <TypeSelector value={selectedType} onChange={handleTypeChange} />

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

                    {currency === 'USD' && (
                        <ExchangeRateField
                            amount={amount}
                            exchangeRate={exchangeRate}
                            onExchangeRateChange={(rate) => setValue('exchangeRate', rate)}
                        />
                    )}

                    <CategorySelect
                        categories={categories}
                        type={selectedType}
                        value={selectedCategoryId}
                        onChange={(id) => setValue('categoryId', id)}
                    />
                    {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}

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
