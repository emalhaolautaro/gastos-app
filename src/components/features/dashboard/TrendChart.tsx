import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatCurrency } from '../../../lib/utils';
import { formatCompact } from '../../../utils/formatCompact';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';

interface TrendDataPoint {
    name: string;
    Ingresos: number;
    Gastos: number;
}

interface TrendChartProps {
    data: TrendDataPoint[];
}

export function TrendChart({ data }: TrendChartProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle className="font-bold text-lg">Tendencia Mensual</CardTitle>
                <CardDescription className="font-medium">Ingresos vs Gastos (Todo el año)</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
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
                        <YAxis fontSize={14} tickLine={false} axisLine={false} tickFormatter={formatCompact} tick={{ fontWeight: 'bold' }} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ fontWeight: 'bold' }} />
                        <Area type="monotone" dataKey="Ingresos" stroke="#4ade80" fillOpacity={1} fill="url(#colorIncome)" />
                        <Area type="monotone" dataKey="Gastos" stroke="#f87171" fillOpacity={1} fill="url(#colorExpense)" />
                        <Legend wrapperStyle={{ fontWeight: 'bold', fontSize: '14px' }} />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
