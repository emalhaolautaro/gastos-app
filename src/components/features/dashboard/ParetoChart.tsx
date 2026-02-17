import { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, ReferenceLine, ReferenceArea, Tooltip
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';
import { formatCurrency } from '../../../lib/utils';

interface ParetoDataPoint {
    name: string;
    value: number;
    color: string;
    accumulatedPercentage: number;
    itemPercentage: number;
}

interface ParetoChartProps {
    data: ParetoDataPoint[];
}

interface ABCGroup {
    label: string;
    color: string;
    bgColor: string;
    categories: string[];
    totalValue: number;
    percentOfValue: number;
    percentOfItems: number;
}

export function ParetoChart({ data }: ParetoChartProps) {
    // Classify categories into A/B/C groups
    const { curveData, groups } = useMemo(() => {
        if (data.length === 0) return { curveData: [], groups: [] };

        const totalValue = data.reduce((sum, d) => sum + d.value, 0);

        // Build curve points: each point = cumulative % of items vs cumulative % of value
        // Start with origin (0, 0)
        const points: { itemPct: number; valuePct: number; name: string }[] = [
            { itemPct: 0, valuePct: 0, name: '' }
        ];

        let cumulativeValue = 0;
        data.forEach((d, i) => {
            cumulativeValue += d.value;
            points.push({
                itemPct: Math.round(((i + 1) / data.length) * 100),
                valuePct: totalValue === 0 ? 0 : Math.round((cumulativeValue / totalValue) * 100 * 10) / 10,
                name: d.name,
            });
        });

        // Classify into A (up to 80%), B (80-95%), C (95-100%)
        const groupA: string[] = [];
        const groupB: string[] = [];
        const groupC: string[] = [];
        let accPct = 0;

        data.forEach(d => {
            accPct += totalValue === 0 ? 0 : (d.value / totalValue) * 100;
            if (accPct <= 80) groupA.push(d.name);
            else if (accPct <= 95) groupB.push(d.name);
            else groupC.push(d.name);
        });

        // If group A is empty but there are items, put at least the first one in A
        if (groupA.length === 0 && data.length > 0) {
            groupA.push(groupB.shift() || groupC.shift() || '');
        }

        const valueOfGroup = (names: string[]) =>
            data.filter(d => names.includes(d.name)).reduce((s, d) => s + d.value, 0);

        const groups: ABCGroup[] = [
            {
                label: 'A',
                color: '#ef4444',
                bgColor: '#fecaca',
                categories: groupA,
                totalValue: valueOfGroup(groupA),
                percentOfValue: totalValue === 0 ? 0 : Math.round((valueOfGroup(groupA) / totalValue) * 100),
                percentOfItems: Math.round((groupA.length / data.length) * 100),
            },
            {
                label: 'B',
                color: '#f97316',
                bgColor: '#fed7aa',
                categories: groupB,
                totalValue: valueOfGroup(groupB),
                percentOfValue: totalValue === 0 ? 0 : Math.round((valueOfGroup(groupB) / totalValue) * 100),
                percentOfItems: Math.round((groupB.length / data.length) * 100),
            },
            {
                label: 'C',
                color: '#3b82f6',
                bgColor: '#bfdbfe',
                categories: groupC,
                totalValue: valueOfGroup(groupC),
                percentOfValue: totalValue === 0 ? 0 : Math.round((valueOfGroup(groupC) / totalValue) * 100),
                percentOfItems: Math.round((groupC.length / data.length) * 100),
            },
        ].filter(g => g.categories.length > 0);

        return { curveData: points, groups };
    }, [data]);

    // Compute x-axis boundaries for A/B/C reference areas
    const aBoundary = data.length > 0
        ? Math.round(((groups[0]?.categories.length ?? 0) / data.length) * 100)
        : 0;
    const bBoundary = data.length > 0
        ? Math.round((((groups[0]?.categories.length ?? 0) + (groups[1]?.categories.length ?? 0)) / data.length) * 100)
        : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-bold text-lg">Análisis ABC de Gastos (Pareto)</CardTitle>
                <CardDescription className="font-medium">
                    Clasifica categorías según su impacto en el gasto total
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <div className="space-y-4">
                        {/* Chart */}
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={curveData}
                                    margin={{ top: 10, right: 10, bottom: 10, left: 45 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="itemPct"
                                        type="number"
                                        domain={[0, 100]}
                                        tickFormatter={(v) => `${v}%`}
                                        tick={{ fontSize: 12, fontWeight: 600 }}
                                        label={{ value: '% Categorías', position: 'insideBottom', offset: -5, fontSize: 13, fontWeight: 700 }}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        tickFormatter={(v) => `${v}%`}
                                        tick={{ fontSize: 12, fontWeight: 600 }}
                                        label={{ value: '% Gasto acumulado', angle: -90, position: 'insideLeft', dx: -35, dy: 65, fontSize: 13, fontWeight: 700 }}
                                    />

                                    {/* Zone A background */}
                                    {aBoundary > 0 && (
                                        <ReferenceArea x1={0} x2={aBoundary} y1={0} y2={100} fill="#fecaca" fillOpacity={0.4} />
                                    )}
                                    {/* Zone B background */}
                                    {bBoundary > aBoundary && (
                                        <ReferenceArea x1={aBoundary} x2={bBoundary} y1={0} y2={100} fill="#fed7aa" fillOpacity={0.4} />
                                    )}
                                    {/* Zone C background */}
                                    {bBoundary < 100 && (
                                        <ReferenceArea x1={bBoundary} x2={100} y1={0} y2={100} fill="#bfdbfe" fillOpacity={0.4} />
                                    )}

                                    {/* 80% and 95% threshold lines */}
                                    <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} />
                                    <ReferenceLine y={95} stroke="#f97316" strokeDasharray="5 5" strokeWidth={1.5} />

                                    <Tooltip
                                        formatter={(value: any) => [`${value}%`, 'Acumulado']}
                                        labelFormatter={(label: any) => `${label}% de categorías`}
                                        contentStyle={{ borderRadius: '8px', fontWeight: 600, fontSize: 13 }}
                                    />

                                    {/* The S-curve */}
                                    <Area
                                        type="monotone"
                                        dataKey="valuePct"
                                        stroke="#1e293b"
                                        strokeWidth={3}
                                        fill="url(#curveGradient)"
                                        dot={{ r: 4, fill: '#1e293b', strokeWidth: 2 }}
                                    />

                                    <defs>
                                        <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1e293b" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#1e293b" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Group legend cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {groups.map((group) => (
                                <div
                                    key={group.label}
                                    className="rounded-lg border p-3 space-y-1"
                                    style={{ backgroundColor: group.bgColor + '40', borderColor: group.color + '40' }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="text-lg font-black w-8 h-8 rounded-full flex items-center justify-center text-white"
                                            style={{ backgroundColor: group.color }}
                                        >
                                            {group.label}
                                        </span>
                                        <div>
                                            <p className="text-sm font-bold" style={{ color: group.color }}>
                                                {group.percentOfItems}% de categorías → {group.percentOfValue}% del gasto
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground font-medium pl-10">
                                        {group.categories.join(', ')} ({formatCurrency(group.totalValue, 'ARS')})
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground font-medium">
                        No hay datos suficientes para el análisis
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
