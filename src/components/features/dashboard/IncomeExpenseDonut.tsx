import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatCurrency } from '../../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';

interface IncomeExpenseDonutProps {
    income: number;
    expenses: number;
}

export function IncomeExpenseDonut({ income, expenses }: IncomeExpenseDonutProps) {
    const hasData = income > 0 || expenses > 0;
    const data = [
        { name: 'Ingresos', value: income },
        { name: 'Gastos', value: expenses },
    ];

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Distribución: Ingresos vs Gastos</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
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
    );
}
