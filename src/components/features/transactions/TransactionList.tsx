import { useState, useMemo } from 'react';
import { Category, Transaction } from '../../../types';
import { getAvailableYears } from '../../../utils/dateHelpers';
import { getCategoryById } from '../../../utils/categoryHelpers';
import { TransactionFilters } from './TransactionFilters';
import { TransactionCard } from './TransactionCard';
import { TransactionEditDialog } from './TransactionEditDialog';
import { Pagination } from '../../ui/Pagination';
import { ConfirmDialog, useConfirmDialog } from '../../ui/ConfirmDialog';

const ITEMS_PER_PAGE = 15;

interface TransactionListProps {
    transactions: Transaction[];
    categories: Category[];
    onDeleteTransaction: (id: number) => void;
    onUpdateTransaction: (id: number, transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => void;
}

export function TransactionList({ transactions, categories, onDeleteTransaction, onUpdateTransaction }: TransactionListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
    const [currentPage, setCurrentPage] = useState(1);
    const { confirm, dialogProps } = useConfirmDialog();

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

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

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedTransactions = filteredTransactions.slice(
        (safeCurrentPage - 1) * ITEMS_PER_PAGE,
        safeCurrentPage * ITEMS_PER_PAGE
    );

    const resetPage = () => setCurrentPage(1);

    const handleFilterChange = (setter: (v: string) => void) => (value: string) => {
        setter(value);
        resetPage();
    };

    const handleDelete = (id: number) => {
        confirm({
            title: 'Eliminar transacción',
            description: '¿Estás seguro de que querés eliminar esta transacción? Esta acción no se puede deshacer.',
            confirmLabel: 'Eliminar',
            variant: 'destructive',
            onConfirm: () => onDeleteTransaction(id),
        });
    };

    const openEditDialog = (t: Transaction) => {
        setEditingTransaction(t);
        setEditDialogOpen(true);
    };

    const handleEditSave = (id: number, data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
        onUpdateTransaction(id, data);
        setEditingTransaction(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <TransactionFilters
                searchTerm={searchTerm}
                onSearchChange={handleFilterChange(setSearchTerm)}
                selectedYear={selectedYear}
                onYearChange={handleFilterChange(setSelectedYear)}
                selectedMonth={selectedMonth}
                onMonthChange={handleFilterChange(setSelectedMonth)}
                availableYears={availableYears}
            />

            <div className="grid gap-4">
                {paginatedTransactions.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                        No se encontraron transacciones
                    </div>
                ) : (
                    paginatedTransactions.map((transaction) => (
                        <TransactionCard
                            key={transaction.id}
                            transaction={transaction}
                            category={getCategoryById(categories, transaction.category_id)}
                            onEdit={openEditDialog}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>

            <Pagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            <TransactionEditDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                transaction={editingTransaction}
                categories={categories}
                onSave={handleEditSave}
            />

            <ConfirmDialog {...dialogProps} />
        </div>
    );
}
