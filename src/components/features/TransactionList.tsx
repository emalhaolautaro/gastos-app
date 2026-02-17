import { useState, useMemo } from 'react';
import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Category, Transaction } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { getAvailableYears } from '../../utils/dateHelpers';
import { getCategoryById } from '../../utils/categoryHelpers';
import { MONTHS } from '../../data/months';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Trash2, Search, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { ConfirmDialog, useConfirmDialog } from '../ui/ConfirmDialog';

interface TransactionListProps {
    transactions: Transaction[];
    categories: Category[];
    onDeleteTransaction: (id: number) => void;
}

export function TransactionList({ transactions, categories, onDeleteTransaction }: TransactionListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
    const { confirm, dialogProps } = useConfirmDialog();

    const availableYears = useMemo(
        () => getAvailableYears(transactions),
        [transactions]
    );

    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => {
                const date = new Date(t.date);
                const matchYear = selectedYear === 'all' || date.getFullYear().toString() === selectedYear;
                const matchMonth = selectedMonth === 'all' || (date.getMonth() + 1).toString() === selectedMonth;
                const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
                return matchYear && matchMonth && matchSearch;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, selectedYear, selectedMonth, searchTerm]);

    const handleDelete = (id: number) => {
        confirm({
            title: 'Eliminar transacción',
            description: '¿Estás seguro de que querés eliminar esta transacción? Esta acción no se puede deshacer.',
            confirmLabel: 'Eliminar',
            variant: 'destructive',
            onConfirm: () => onDeleteTransaction(id),
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card p-4 rounded-lg shadow-sm border">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar transacción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Año" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los años</SelectItem>
                            {availableYears.map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los meses</SelectItem>
                            {MONTHS.map(m => (
                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                        No se encontraron transacciones
                    </div>
                ) : (
                    filteredTransactions.map((transaction) => {
                        const category = getCategoryById(categories, transaction.category_id);
                        const isExpense = transaction.type === 'expense';
                        const parsedDate = parseISO(transaction.date);

                        return (
                            <Card key={transaction.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <div className="flex items-center p-4">
                                    {/* Date badge */}
                                    <div className="flex flex-col items-center justify-center h-14 w-14 rounded-lg bg-muted text-muted-foreground mr-4 shrink-0">
                                        <span className="text-xs font-bold uppercase">
                                            {format(parsedDate, 'MMM', { locale: es }).replace('.', '')}
                                        </span>
                                        <span className="text-lg font-bold">
                                            {format(parsedDate, 'd')}
                                        </span>
                                    </div>

                                    {/* Type indicator */}
                                    <div className={cn(
                                        "p-2 rounded-full mr-4 shrink-0",
                                        isExpense ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                                    )}>
                                        {isExpense ? <ArrowDownCircle className="h-5 w-5" /> : <ArrowUpCircle className="h-5 w-5" />}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0 grid gap-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold truncate text-lg leading-none">{transaction.description}</p>
                                            <p className={cn(
                                                "font-bold text-lg whitespace-nowrap",
                                                isExpense ? "text-destructive" : "text-green-600"
                                            )}>
                                                {isExpense ? '-' : '+'}{formatCurrency(transaction.amount_in_ars, 'ARS')}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                                    style={{ backgroundColor: `${category?.color ?? '#999'}20`, color: category?.color ?? '#999' }}
                                                >
                                                    {category?.name ?? 'Sin categoría'}
                                                </span>
                                                {transaction.currency === 'USD' && (
                                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200">
                                                        USD {transaction.amount.toFixed(2)} (TC: {transaction.exchange_rate})
                                                    </span>
                                                )}
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 -mr-2 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleDelete(transaction.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )
                    })
                )}
            </div>

            <ConfirmDialog {...dialogProps} />
        </div>
    );
}
