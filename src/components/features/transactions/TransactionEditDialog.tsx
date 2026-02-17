import { useState } from 'react';
import { Category, Transaction } from '../../../types';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { TypeSelector } from '../shared/TypeSelector';
import { CategorySelect } from '../shared/CategorySelect';
import { ExchangeRateField } from '../shared/ExchangeRateField';
import { DatePickerField } from '../../ui/DatePickerField';

interface TransactionEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: Transaction | null;
    categories: Category[];
    onSave: (id: number, data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => void;
}

export function TransactionEditDialog({ open, onOpenChange, transaction, categories, onSave }: TransactionEditDialogProps) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(0);
    const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS');
    const [exchangeRate, setExchangeRate] = useState<number | undefined>(undefined);
    const [categoryId, setCategoryId] = useState(0);
    const [date, setDate] = useState<Date>(new Date());
    const [type, setType] = useState<'income' | 'expense'>('expense');

    // Sync state when a new transaction is opened for editing
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen && transaction) {
            setDescription(transaction.description);
            setAmount(transaction.amount);
            setCurrency(transaction.currency);
            setExchangeRate(transaction.exchange_rate ?? undefined);
            setCategoryId(transaction.category_id);
            setDate(new Date(transaction.date));
            setType(transaction.type);
        }
        onOpenChange(isOpen);
    };

    const handleSave = () => {
        if (!transaction || !description.trim() || amount <= 0) return;

        const amountInARS = currency === 'USD'
            ? (amount * (exchangeRate || 1))
            : amount;

        onSave(transaction.id, {
            description,
            amount,
            amount_in_ars: amountInARS,
            currency,
            exchange_rate: exchangeRate ?? null,
            category_id: categoryId,
            date: date.toISOString(),
            type,
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl w-[90vw] max-h-[85vh] overflow-y-auto bg-[#ffe4e6] border-pink-200">
                <DialogHeader>
                    <DialogTitle className="font-bold text-xl">Editar Transacción</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <TypeSelector value={type} onChange={setType} />

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Descripción</Label>
                        <Input
                            id="edit-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-white border-pink-100"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-amount">Monto</Label>
                            <Input
                                id="edit-amount"
                                type="number"
                                step="0.01"
                                value={amount || ''}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                className="bg-white border-pink-100 font-bold"
                            />
                        </div>

                        {/* Currency */}
                        <div className="space-y-2">
                            <Label>Moneda</Label>
                            <Select value={currency} onValueChange={(v: 'ARS' | 'USD') => setCurrency(v)}>
                                <SelectTrigger className="bg-white border-pink-100 font-bold">
                                    <SelectValue />
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
                            onExchangeRateChange={setExchangeRate}
                        />
                    )}

                    <CategorySelect
                        categories={categories}
                        type={type}
                        value={categoryId}
                        onChange={setCategoryId}
                        className="bg-white border-pink-100"
                    />

                    {/* Date */}
                    <div className="space-y-2 flex flex-col">
                        <DatePickerField
                            value={date}
                            onChange={setDate}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent border-black/20 hover:bg-black/5">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800 shadow-md">
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
