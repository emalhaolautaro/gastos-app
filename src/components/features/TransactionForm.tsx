import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from "date-fns"
import { es } from 'date-fns/locale';
import { Category, Transaction } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';
import { formatCurrency, cn } from '../../lib/utils';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import * as Icons from 'lucide-react';

const transactionSchema = z.object({
    description: z.string().min(1, 'La descripción es obligatoria'),
    amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
    currency: z.enum(['ARS', 'USD']),
    exchangeRate: z.number().optional(),
    categoryId: z.string().min(1, 'Debes seleccionar una categoría'),
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
    onAddTransaction: (transaction: Transaction) => void;
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

    // Filter categories by selected type
    const filteredCategories = categories.filter(c => c.type === selectedType);

    // Helper to get Icon
    const IconComponent = ({ name, className }: { name: string, className?: string }) => {
        const Icon = (Icons as any)[name] || Icons.HelpCircle;
        return <Icon className={className} />;
    };

    // Get selected category object for displaying icon in trigger if needed (though SelectValue handles it usually)
    const selectedCategory = categories.find(c => c.id === selectedCategoryId);


    const onSubmit = (data: TransactionFormValues) => {
        const amountInARS = data.currency === 'USD'
            ? (data.amount * (data.exchangeRate || 1))
            : data.amount;

        const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            description: data.description,
            amount: data.amount,
            amountInARS,
            currency: data.currency,
            exchangeRate: data.exchangeRate,
            categoryId: data.categoryId,
            date: data.date.toISOString(),
            type: data.type,
        };

        onAddTransaction(newTransaction);
        reset({
            type: selectedType,
            currency: 'ARS',
            date: new Date(),
            amount: 0,
            description: '',
            categoryId: '',
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
        <Card className="w-full max-w-2xl mx-auto shadow-sm border bg-[#fff7ed]"> {/* Light Beige Background */}
            <div className="p-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Nueva Transacción</h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Type Selector  */}
                    <div className="flex p-1 bg-muted/50 rounded-lg border">
                        <button
                            type="button"
                            className={cn(
                                "flex-1 py-2 text-base font-bold rounded-md transition-all",
                                selectedType === 'expense'
                                    ? "bg-[#fce7f3] text-foreground shadow-sm border border-pink-200"
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
                                "flex-1 py-2 text-base font-bold rounded-md transition-all",
                                selectedType === 'income'
                                    ? "bg-[#fce7f3] text-foreground shadow-sm border border-pink-200"
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
                        <Label htmlFor="description" className="font-bold text-base">Descripción</Label>
                        <Input
                            id="description"
                            placeholder="Ej: Supermercado"
                            {...register('description')}
                            className="bg-[#fffbeb] border-input placeholder:text-muted-foreground font-medium text-base" // Beige-ish input
                        />
                        {errors.description && <p className="text-sm text-red-500 font-medium">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="font-bold text-base">Monto</Label>
                            <div className="relative">
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    onChange={handleAmountChange}
                                    className="bg-[#fffbeb] border-input pr-16 font-bold text-base"
                                />
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground font-bold text-base">
                                    {currency}
                                </div>
                            </div>
                            {errors.amount && <p className="text-sm text-red-500 font-medium">{errors.amount.message}</p>}
                        </div>

                        {/* Currency */}
                        <div className="space-y-2">
                            <Label htmlFor="currency" className="font-bold text-base">Moneda</Label>
                            <Select onValueChange={(val: 'ARS' | 'USD') => setValue('currency', val)} defaultValue="ARS">
                                <SelectTrigger className="bg-[#fffbeb] border-input font-bold text-base">
                                    <SelectValue placeholder="Selecciona moneda" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ARS" className="font-medium text-base">🇦🇷 ARS (Pesos)</SelectItem>
                                    <SelectItem value="USD" className="font-medium text-base">🇺🇸 USD (Dólares)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Exchange Rate (Conditional) */}
                    {currency === 'USD' && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md space-y-4 animate-in fade-in zoom-in-95">
                            <div className="space-y-2">
                                <Label htmlFor="exchangeRate" className="text-amber-700 font-bold text-base">Cotización del Dólar (ARS)</Label>
                                <Input
                                    id="exchangeRate"
                                    type="number"
                                    step="0.01"
                                    placeholder="Ej: 1100"
                                    onChange={handleRateChange}
                                    className="bg-white border-amber-200 font-medium text-base"
                                />
                                {errors.exchangeRate && <p className="text-sm text-red-500 font-medium">{errors.exchangeRate.message}</p>}
                            </div>
                            {amount > 0 && exchangeRate && exchangeRate > 0 && (
                                <div className="text-sm text-amber-700 font-bold flex justify-between text-base">
                                    <span>Conversión estimada:</span>
                                    <span>{formatCurrency(amount * exchangeRate, 'ARS')}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category" className="font-bold text-base">Categoría</Label>
                        <Select onValueChange={(val) => setValue('categoryId', val)}>
                            <SelectTrigger className="bg-[#fffbeb] border-input h-12 font-medium text-base"> {/* Taller trigger for icon */}
                                <div className="flex items-center gap-2">
                                    {selectedCategory ? (
                                        <>
                                            <div className="p-1.5 rounded-full bg-black/5" style={{ color: selectedCategory.color }}>
                                                <IconComponent name={selectedCategory.icon} className="h-4 w-4" />
                                            </div>
                                            <span className="font-bold text-base">{selectedCategory.name}</span>
                                        </>
                                    ) : <span className="text-muted-foreground font-normal">Selecciona una categoría</span>}
                                </div>
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {filteredCategories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="p-1.5 rounded-full bg-black/5 flex items-center justify-center"
                                                style={{ color: cat.color }}
                                            >
                                                <IconComponent name={cat.icon} className="h-4 w-4" />
                                            </div>
                                            <span className="font-semibold text-base">{cat.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.categoryId && <p className="text-sm text-red-500 font-medium">{errors.categoryId.message}</p>}
                    </div>

                    {/* Date Picker (Custom) */}
                    <div className="space-y-2 flex flex-col">
                        <Label htmlFor="date" className="font-bold text-base">Fecha</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal bg-[#fffbeb] border-input hover:bg-accent text-base",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-[#fffbeb]" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => d && setValue('date', d)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
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
