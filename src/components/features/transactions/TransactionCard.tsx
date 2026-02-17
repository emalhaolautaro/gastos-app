import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Category, Transaction } from '../../../types';
import { formatCurrency, cn } from '../../../lib/utils';

import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Trash2, ArrowUpCircle, ArrowDownCircle, Edit2 } from 'lucide-react';

interface TransactionCardProps {
    transaction: Transaction;
    category: Category | undefined;
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: number) => void;
}

export function TransactionCard({ transaction, category, onEdit, onDelete }: TransactionCardProps) {
    const isExpense = transaction.type === 'expense';
    const parsedDate = parseISO(transaction.date);

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
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
                                    USD {transaction.amount.toFixed(2)} (TC: {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(transaction.exchange_rate ?? 0)})
                                </span>
                            )}
                        </div>

                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => onEdit(transaction)}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 -mr-2 text-muted-foreground hover:text-destructive"
                                onClick={() => onDelete(transaction.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
