import { useMemo } from 'react';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, Cell, Tooltip, ReferenceLine, Legend
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

// ABC thresholds with 5% tolerance on group A
const THRESHOLD_A = 80; // standard 80% + 5% tolerance
const THRESHOLD_B = 90;

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
    const { groups, zoneColorMap } = useMemo(() => {
        if (data.length === 0) return { groups: [], zoneColorMap: {} as Record<string, string> };

        const totalValue = data.reduce((sum, d) => sum + d.value, 0);

        const groupA: string[] = [];
        const groupB: string[] = [];
        const groupC: string[] = [];
        let accPct = 0;

        data.forEach(d => {
            accPct += totalValue === 0 ? 0 : (d.value / totalValue) * 100;
            if (accPct <= THRESHOLD_A) groupA.push(d.name);
            else if (accPct <= THRESHOLD_B) groupB.push(d.name);
            else groupC.push(d.name);
        });

        if (groupA.length === 0 && data.length > 0) {
            groupA.push(groupB.shift() || groupC.shift() || '');
        }

        const valueOfGroup = (names: string[]) =>
            data.filter(d => names.includes(d.name)).reduce((s, d) => s + d.value, 0);

        const COLOR_A = '#ef4444';
        const COLOR_B = '#f97316';
        const COLOR_C = '#3b82f6';

        // Map each category name to its ABC zone color
        const zoneColorMap: Record<string, string> = {};
        groupA.forEach(name => zoneColorMap[name] = COLOR_A);
        groupB.forEach(name => zoneColorMap[name] = COLOR_B);
        groupC.forEach(name => zoneColorMap[name] = COLOR_C);

        const groups: ABCGroup[] = [
            {
                label: 'A',
                color: COLOR_A,
                bgColor: '#fecaca',
                categories: groupA,
                totalValue: valueOfGroup(groupA),
                percentOfValue: totalValue === 0 ? 0 : Math.round((valueOfGroup(groupA) / totalValue) * 100),
                percentOfItems: data.length === 0 ? 0 : Math.round((groupA.length / data.length) * 100),
            },
            {
                label: 'B',
                color: COLOR_B,
                bgColor: '#fed7aa',
                categories: groupB,
                totalValue: valueOfGroup(groupB),
                percentOfValue: totalValue === 0 ? 0 : Math.round((valueOfGroup(groupB) / totalValue) * 100),
                percentOfItems: data.length === 0 ? 0 : Math.round((groupB.length / data.length) * 100),
            },
            {
                label: 'C',
                color: COLOR_C,
                bgColor: '#bfdbfe',
                categories: groupC,
                totalValue: valueOfGroup(groupC),
                percentOfValue: totalValue === 0 ? 0 : Math.round((valueOfGroup(groupC) / totalValue) * 100),
                percentOfItems: data.length === 0 ? 0 : Math.round((groupC.length / data.length) * 100),
            },
        ].filter(g => g.categories.length > 0);

        return { groups, zoneColorMap };
    }, [data]);

    // Custom tooltip
    const renderTooltip = ({ active, payload }: any) => {
        if (!active || !payload || payload.length === 0) return null;
        const point = payload[0]?.payload;
        if (!point) return null;

        return (
            <div className="bg-card border rounded-lg shadow-lg p-3 text-sm space-y-1">
                <p className="font-bold text-foreground">{point.name}</p>
                <p className="text-muted-foreground">
                    Gasto: <span className="font-semibold text-foreground">{formatCurrency(point.value, 'ARS')}</span>
                </p>
                <p className="text-muted-foreground">
                    Acumulado: <span className="font-semibold text-foreground">{point.accumulatedPercentage.toFixed(1)}%</span>
                </p>
            </div>
        );
    };

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
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                    data={data}
                                    margin={{ top: 10, right: 15, bottom: 40, left: 15 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12, fontWeight: 600 }}
                                        interval={0}
                                        angle={-25}
                                        textAnchor="end"
                                    />

                                    {/* Left axis: absolute amount */}
                                    <YAxis
                                        yAxisId="left"
                                        orientation="left"
                                        tick={{ fontSize: 12, fontWeight: 600 }}
                                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                                    />

                                    {/* Right axis: cumulative percentage */}
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        domain={[0, 100]}
                                        tick={{ fontSize: 12, fontWeight: 600 }}
                                        tickFormatter={(v) => `${v}%`}
                                    />

                                    {/* 80% threshold line */}
                                    <ReferenceLine
                                        yAxisId="right"
                                        y={80}
                                        stroke="#ef4444"
                                        strokeDasharray="6 4"
                                        strokeWidth={2}
                                        label={{ value: '80%', position: 'right', fill: '#ef4444', fontWeight: 700, fontSize: 12 }}
                                    />

                                    <Tooltip content={renderTooltip} />

                                    <Legend
                                        verticalAlign="top"
                                        wrapperStyle={{ fontWeight: 600, fontSize: 13 }}
                                    />

                                    {/* Bars colored by ABC zone */}
                                    <Bar
                                        yAxisId="left"
                                        dataKey="value"
                                        name="Gasto por categoría"
                                        barSize={60}
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {data.map((entry, i) => (
                                            <Cell key={`bar-${i}`} fill={zoneColorMap[entry.name] || '#9ca3af'} />
                                        ))}
                                    </Bar>

                                    {/* Cumulative percentage line */}
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="accumulatedPercentage"
                                        name="% Acumulado"
                                        stroke="#1e293b"
                                        strokeWidth={3}
                                        dot={{ r: 5, fill: '#1e293b', strokeWidth: 0 }}
                                        activeDot={{ r: 7, fill: '#1e293b' }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        {/* ABC group legend */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {groups.map((group) => (
                                <div
                                    key={group.label}
                                    className="rounded-lg border p-3 space-y-1"
                                    style={{ backgroundColor: group.bgColor + '40', borderColor: group.color + '40' }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="text-lg font-black w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
                                            style={{ backgroundColor: group.color }}
                                        >
                                            {group.label}
                                        </span>
                                        <p className="text-sm font-bold" style={{ color: group.color }}>
                                            {group.percentOfItems}% de categorías → {group.percentOfValue}% del gasto
                                        </p>
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
