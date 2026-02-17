import { useMemo } from 'react';
import { Transaction, Category } from '../../../types';
import { getCategoryName } from '../../../utils/categoryHelpers';
import { formatCurrency } from '../../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';

interface CashFlowTableProps {
    transactions: Transaction[];
    categories: Category[];
    selectedYear: string;
}

const MONTH_HEADERS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function CashFlowTable({ transactions, categories, selectedYear }: CashFlowTableProps) {
    const { expenseRows, incomeRows, expenseTotals, incomeTotals, netBalance, accumulatedBalance } = useMemo(() => {
        // Filter transactions for the selected year only (ignores month filter)
        const yearTx = transactions.filter(t =>
            new Date(t.date).getFullYear().toString() === selectedYear
        );

        // Group by type → category → month
        const buildRows = (type: 'expense' | 'income') => {
            const catMap: Record<number, number[]> = {};

            yearTx.filter(t => t.type === type).forEach(t => {
                const monthIdx = new Date(t.date).getMonth();
                if (!catMap[t.category_id]) catMap[t.category_id] = new Array(12).fill(0);
                catMap[t.category_id][monthIdx] += t.amount_in_ars;
            });

            return Object.entries(catMap)
                .map(([catId, months]) => ({
                    name: getCategoryName(categories, Number(catId)),
                    months,
                    total: months.reduce((s, v) => s + v, 0),
                }))
                .sort((a, b) => b.total - a.total);
        };

        const expenseRows = buildRows('expense');
        const incomeRows = buildRows('income');

        // Monthly totals
        const expenseTotals = Array.from({ length: 12 }, (_, i) =>
            expenseRows.reduce((sum, row) => sum + row.months[i], 0)
        );
        const incomeTotals = Array.from({ length: 12 }, (_, i) =>
            incomeRows.reduce((sum, row) => sum + row.months[i], 0)
        );

        // Net balance per month
        const netBalance = incomeTotals.map((inc, i) => inc - expenseTotals[i]);

        // Accumulated balance
        const accumulatedBalance: number[] = [];
        netBalance.forEach((net, i) => {
            accumulatedBalance.push((accumulatedBalance[i - 1] || 0) + net);
        });

        return { expenseRows, incomeRows, expenseTotals, incomeTotals, netBalance, accumulatedBalance };
    }, [transactions, categories, selectedYear]);

    const fmt = (v: number) => v === 0 ? '-' : formatCurrency(v, 'ARS');

    const cellClass = "px-3 py-2 text-right text-sm whitespace-nowrap";
    const headerCellClass = "px-3 py-2 text-center text-sm font-bold";
    const labelCellClass = "px-4 py-2 text-sm whitespace-nowrap";

    const renderRow = (label: string, months: number[], bold = false, indent = true, totalOverride?: number) => (
        <tr key={label} className={bold ? 'bg-muted/50 font-bold' : 'hover:bg-muted/30 transition-colors'}>
            <td className={`${labelCellClass} ${indent && !bold ? 'pl-8' : ''} ${bold ? 'font-bold' : ''}`}>
                {label}
            </td>
            {months.map((v, i) => (
                <td key={i} className={`${cellClass} ${bold ? 'font-bold' : ''} ${v < 0 ? 'text-red-500' : ''}`}>
                    {fmt(v)}
                </td>
            ))}
            {(() => {
                const total = totalOverride !== undefined ? totalOverride : months.reduce((s, v) => s + v, 0);
                return (
                    <td className={`${cellClass} font-semibold ${total < 0 ? 'text-red-500' : ''}`}>
                        {fmt(total)}
                    </td>
                );
            })()}
        </tr>
    );

    // Special row for saldo with pink background
    const renderSaldoRow = (label: string, months: number[], totalOverride?: number) => (
        <tr key={label} className="font-bold" style={{ backgroundColor: '#fce4ec' }}>
            <td className={`${labelCellClass} font-bold`}>{label}</td>
            {months.map((v, i) => (
                <td key={i} className={`${cellClass} font-bold ${v < 0 ? 'text-red-500' : ''}`}>
                    {fmt(v)}
                </td>
            ))}
            {(() => {
                const total = totalOverride !== undefined ? totalOverride : months.reduce((s, v) => s + v, 0);
                return (
                    <td className={`${cellClass} font-bold ${total < 0 ? 'text-red-500' : ''}`}>
                        {fmt(total)}
                    </td>
                );
            })()}
        </tr>
    );

    const renderSectionHeader = (label: string) => (
        <tr key={`header-${label}`} className="bg-primary/10">
            <td className={`${labelCellClass} font-bold text-primary`}>{label}</td>
            <td colSpan={13}></td>
        </tr>
    );

    // For accumulated balance: show real accumulated values
    const accumulatedDisplay = accumulatedBalance;

    // The "total" for accumulated is the last accumulated value, not the sum
    const lastAccumulated = accumulatedBalance[accumulatedBalance.length - 1] || 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-bold text-lg">Flujo de Caja — {selectedYear}</CardTitle>
                <CardDescription className="font-medium">
                    Desglose mensual de ingresos y gastos por categoría
                </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse">
                    <thead>
                        <tr className="border-b-2 border-primary/20">
                            <th className={`${labelCellClass} text-left font-bold min-w-[180px]`}>Categoría</th>
                            {MONTH_HEADERS.map(m => (
                                <th key={m} className={headerCellClass}>{m}</th>
                            ))}
                            <th className={`${headerCellClass} border-l-2 border-primary/20`}>Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {/* Gastos section */}
                        {renderSectionHeader('Gastos')}
                        {expenseRows.map(row => renderRow(row.name, row.months))}
                        {renderRow('Gastos totales', expenseTotals, true, false)}

                        {/* Ingresos section */}
                        {renderSectionHeader('Ingresos')}
                        {incomeRows.map(row => renderRow(row.name, row.months))}
                        {renderRow('Ingresos totales', incomeTotals, true, false)}

                        {/* Balance section — pink background */}
                        <tr className="border-t-2 border-primary/20"></tr>
                        {renderSaldoRow('Saldo de caja neto', netBalance)}
                        {renderSaldoRow('Saldo acumulado', accumulatedDisplay, lastAccumulated)}
                    </tbody>
                </table>

                {expenseRows.length === 0 && incomeRows.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground font-medium">
                        No hay datos para {selectedYear}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
