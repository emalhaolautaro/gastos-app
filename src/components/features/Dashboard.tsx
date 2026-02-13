import { useState, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, ComposedChart, Line, Bar
} from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp } from 'lucide-react';
import { Category, Transaction } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface DashboardProps {
    transactions: Transaction[];
    categories: Category[];
}

export function Dashboard({ transactions, categories }: DashboardProps) {
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState<string>('all');

    // Helpers
    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Desconocido';
    const getCategoryColor = (id: string) => categories.find(c => c.id === id)?.color || '#9ca3af';

    // Available Years
    const availableYears = useMemo(() => {
        const years = Array.from(new Set(transactions.map(t => new Date(t.date).getFullYear())));
        if (!years.includes(new Date().getFullYear())) {
            years.push(new Date().getFullYear());
        }
        return years.sort((a, b) => b - a);
    }, [transactions]);

    // Filtered Transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = new Date(t.date);
            const yearMatch = date.getFullYear().toString() === selectedYear;
            const monthMatch = selectedMonth === 'all' || (date.getMonth() + 1).toString() === selectedMonth;
            return yearMatch && monthMatch;
        });
    }, [transactions, selectedYear, selectedMonth]);

    // Summary Metrics
    const summary = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amountInARS, 0);
        const expenses = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amountInARS, 0);
        const balance = income - expenses;
        const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
        return { income, expenses, balance, savingsRate };
    }, [filteredTransactions]);

    // Chart Data: Monthly Trend (Area Chart)
    const trendData = useMemo(() => {
        const months = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(parseInt(selectedYear), i, 1);
            const monthName = d.toLocaleDateString('es-AR', { month: 'short' });
            return { name: monthName, monthIndex: i, Ingresos: 0, Gastos: 0 };
        });

        transactions.filter(t => new Date(t.date).getFullYear().toString() === selectedYear).forEach(t => {
            const monthIndex = new Date(t.date).getMonth();
            if (t.type === 'income') months[monthIndex].Ingresos += t.amountInARS;
            else months[monthIndex].Gastos += t.amountInARS;
        });

        return months;
    }, [transactions, selectedYear]);


    // Chart Data: Expenses by Category (Pie & ABC)
    const expensesByCategory = useMemo(() => {
        const expenses = filteredTransactions.filter(t => t.type === 'expense');
        const grouped: Record<string, number> = {};

        expenses.forEach(t => {
            if (!grouped[t.categoryId]) grouped[t.categoryId] = 0;
            grouped[t.categoryId] += t.amountInARS;
        });

        return Object.entries(grouped)
            .map(([id, amount]) => ({
                name: getCategoryName(id),
                value: amount,
                color: getCategoryColor(id)
            }))
            .sort((a, b) => b.value - a.value);
    }, [filteredTransactions, categories]);

    // Pareto Data
    const paretoData = useMemo(() => {
        const total = expensesByCategory.reduce((sum, item) => sum + item.value, 0);
        let accumulated = 0;
        return expensesByCategory.map(item => {
            accumulated += item.value;
            return {
                ...item,
                accumulatedPercentage: total === 0 ? 0 : (accumulated / total) * 100
            };
        });
    }, [expensesByCategory]);

    // Pareto Data


    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center mb-6">
                <div className="flex items-center gap-2">
                    <label className="text-base font-bold">Filtrar por año:</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[140px] bg-card font-semibold text-base">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map(year => <SelectItem key={year} value={year.toString()} className="font-medium text-base">{year}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-base font-bold">Filtrar por mes:</label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[160px] bg-card font-semibold text-base">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="font-medium text-base">Todos los meses</SelectItem>
                            <SelectItem value="1" className="font-medium text-base">Enero</SelectItem>
                            <SelectItem value="2" className="font-medium text-base">Febrero</SelectItem>
                            <SelectItem value="3" className="font-medium text-base">Marzo</SelectItem>
                            <SelectItem value="4" className="font-medium text-base">Abril</SelectItem>
                            <SelectItem value="5" className="font-medium text-base">Mayo</SelectItem>
                            <SelectItem value="6" className="font-medium text-base">Junio</SelectItem>
                            <SelectItem value="7" className="font-medium text-base">Julio</SelectItem>
                            <SelectItem value="8" className="font-medium text-base">Agosto</SelectItem>
                            <SelectItem value="9" className="font-medium text-base">Septiembre</SelectItem>
                            <SelectItem value="10" className="font-medium text-base">Octubre</SelectItem>
                            <SelectItem value="11" className="font-medium text-base">Noviembre</SelectItem>
                            <SelectItem value="12" className="font-medium text-base">Diciembre</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-bold">Balance Total</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(summary.balance)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-bold">Ingresos Totales</CardTitle>
                        <ArrowUpCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.income)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-bold">Gastos Totales</CardTitle>
                        <ArrowDownCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.expenses)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-bold">Tasa de Ahorro</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.savingsRate.toFixed(1)}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1: Trend & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="font-bold text-lg">Tendencia Mensual</CardTitle>
                        <CardDescription className="font-medium text-base">Ingresos vs Gastos (Todo el año)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" fontSize={14} tickLine={false} axisLine={false} tick={{ fontWeight: 'bold' }} />
                                <YAxis fontSize={14} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} tick={{ fontWeight: 'bold' }} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ fontWeight: 'bold' }} />
                                <Area type="monotone" dataKey="Ingresos" stroke="#4ade80" fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="Gastos" stroke="#f87171" fillOpacity={1} fill="url(#colorExpense)" />
                                <Legend wrapperStyle={{ fontWeight: 'bold', fontSize: '14px' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="font-bold text-lg">Gastos por Categoria</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {expensesByCategory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expensesByCategory}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        animationDuration={1500}
                                        animationEasing="ease-in-out"
                                        animationBegin={0}
                                        isAnimationActive={true}
                                    >
                                        {expensesByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ fontWeight: 'bold' }} />
                                    <Legend wrapperStyle={{ fontWeight: "bold", paddingTop: "10px", fontSize: '14px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground font-medium text-base">
                                No hay datos de gastos para mostrar
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2: Pareto Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-bold text-lg">Análisis ABC de Gastos (Pareto)</CardTitle>
                    <CardDescription className="font-medium text-base">Identifica las categorías que representan el 80% de tus gastos</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    {paretoData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={paretoData}
                                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                            >
                                <CartesianGrid stroke="#f5f5f5" />
                                <XAxis dataKey="name" scale="band" tick={{ fontWeight: 'bold', fontSize: 13 }} interval={0} />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{ fontWeight: 'bold', fontSize: 14 }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" unit="%" domain={[0, 100]} tick={{ fontWeight: 'bold', fontSize: 14 }} />
                                <Legend wrapperStyle={{ fontWeight: 'bold', fontSize: '14px' }} />
                                <Bar yAxisId="left" dataKey="value" barSize={80} fill="#413ea0" name="Gasto">
                                    {paretoData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                                <Line yAxisId="right" type="monotone" dataKey="accumulatedPercentage" stroke="#ff7300" name="Acumulado" dot={{ r: 4 }} activeDot={{ r: 0 }} strokeWidth={2} />
                                {/* 80% Threshold Line */}
                                <Line yAxisId="right" type="monotone" dataKey={() => 80} stroke="red" strokeDasharray="5 5" dot={false} activeDot={false} legendType="none" tooltipType="none" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground font-medium">
                            No hay datos suficientes para el análisis
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Charts Row 3: Income vs Expenses Donut (Optional/Extra) */}
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Distribución: Ingresos vs Gastos</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    {summary.income > 0 || summary.expenses > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Ingresos', value: summary.income },
                                        { name: 'Gastos', value: summary.expenses }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    animationDuration={1000}
                                    animationEasing="ease-out"
                                >
                                    <Cell fill="#4ade80" />
                                    <Cell fill="#f87171" />
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                <Legend wrapperStyle={{ fontWeight: "bold", paddingTop: "10px" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            No hay transacciones registradas
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}
