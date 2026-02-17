import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatCurrency } from '../../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';

interface ChartDataPoint {
    name: string;
    value: number;
    color: string;
}

interface ExpensesPieChartProps {
    data: ChartDataPoint[];
}

export function ExpensesPieChart({ data }: ExpensesPieChartProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle className="font-bold text-lg">Gastos por Categoría</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
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
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ fontWeight: 'bold' }} />
                            <Legend wrapperStyle={{ fontWeight: "bold", paddingTop: "10px", fontSize: '14px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground font-medium">
                        No hay datos de gastos para mostrar
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
