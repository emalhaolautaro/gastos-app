import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Search } from 'lucide-react';
import { MONTHS } from '../../../data/months';

interface TransactionFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedYear: string;
    onYearChange: (value: string) => void;
    selectedMonth: string;
    onMonthChange: (value: string) => void;
    availableYears: number[];
}

export function TransactionFilters({
    searchTerm,
    onSearchChange,
    selectedYear,
    onYearChange,
    selectedMonth,
    onMonthChange,
    availableYears,
}: TransactionFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card p-4 rounded-lg shadow-sm border">
            <div className="relative w-full md:w-1/3">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar transacción..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-8"
                />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
                <Select value={selectedYear} onValueChange={onYearChange}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los años</SelectItem>
                        {availableYears.map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedMonth} onValueChange={onMonthChange}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los meses</SelectItem>
                        {MONTHS.map(m => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
