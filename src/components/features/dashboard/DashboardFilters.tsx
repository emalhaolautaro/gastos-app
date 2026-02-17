import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { MONTHS } from '../../../data/months';

interface DashboardFiltersProps {
    selectedYear: string;
    selectedMonth: string;
    availableYears: number[];
    onYearChange: (year: string) => void;
    onMonthChange: (month: string) => void;
}

export function DashboardFilters({
    selectedYear,
    selectedMonth,
    availableYears,
    onYearChange,
    onMonthChange,
}: DashboardFiltersProps) {
    return (
        <div className="flex flex-wrap gap-4 items-center mb-6">
            <div className="flex items-center gap-2">
                <label className="font-bold">Filtrar por año:</label>
                <Select value={selectedYear} onValueChange={onYearChange}>
                    <SelectTrigger className="w-[140px] bg-card font-semibold">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {availableYears.map(year => (
                            <SelectItem key={year} value={year.toString()}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <label className="font-bold">Filtrar por mes:</label>
                <Select value={selectedMonth} onValueChange={onMonthChange}>
                    <SelectTrigger className="w-[160px] bg-card font-semibold">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los meses</SelectItem>
                        {MONTHS.map(m => (
                            <SelectItem key={m.value} value={m.value}>
                                {m.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
