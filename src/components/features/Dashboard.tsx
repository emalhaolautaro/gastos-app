import { useState, useMemo } from 'react';
import { Category, Transaction } from '../../types';
import { useDashboardData } from '../../hooks/useDashboardData';
import { getAvailableYears } from '../../utils/dateHelpers';
import { DashboardFilters } from './dashboard/DashboardFilters';
import { SummaryCards } from './dashboard/SummaryCards';
import { TrendChart } from './dashboard/TrendChart';
import { ExpensesPieChart } from './dashboard/ExpensesPieChart';
import { ParetoChart } from './dashboard/ParetoChart';
import { IncomeExpenseDonut } from './dashboard/IncomeExpenseDonut';
import { CashFlowTable } from './dashboard/CashFlowTable';

interface DashboardProps {
    transactions: Transaction[];
    categories: Category[];
}

export function Dashboard({ transactions, categories }: DashboardProps) {
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState<string>('all');

    const availableYears = useMemo(
        () => getAvailableYears(transactions),
        [transactions]
    );

    const { summary, trendData, expensesByCategory, paretoData } = useDashboardData(
        transactions,
        categories,
        { selectedYear, selectedMonth }
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <DashboardFilters
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                availableYears={availableYears}
                onYearChange={setSelectedYear}
                onMonthChange={setSelectedMonth}
            />

            <SummaryCards
                balance={summary.balance}
                income={summary.income}
                expenses={summary.expenses}
                savingsRate={summary.savingsRate}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrendChart data={trendData} />
                <ExpensesPieChart data={expensesByCategory} />
            </div>

            <ParetoChart data={paretoData} />

            <IncomeExpenseDonut
                income={summary.income}
                expenses={summary.expenses}
            />

            <CashFlowTable
                transactions={transactions}
                categories={categories}
                selectedYear={selectedYear}
            />
        </div>
    );
}
