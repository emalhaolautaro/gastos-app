import { Category } from '../../../types';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../ui/select';
import { Label } from '../../ui/label';
import { DynamicIcon } from '../../ui/DynamicIcon';

interface CategorySelectProps {
    categories: Category[];
    type: 'income' | 'expense';
    value?: number;
    onChange: (categoryId: number) => void;
    className?: string;
}

export function CategorySelect({ categories, type, value, onChange, className }: CategorySelectProps) {
    const filtered = categories.filter(c => c.type === type);
    const selected = categories.find(c => c.id === value);

    return (
        <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={value?.toString()} onValueChange={(v) => onChange(Number(v))}>
                <SelectTrigger className={`h-12 ${className ?? 'bg-input-background border-input'}`}>
                    <div className="flex items-center gap-2">
                        {selected ? (
                            <>
                                <div className="p-1.5 rounded-full bg-black/5" style={{ color: selected.color }}>
                                    <DynamicIcon name={selected.icon} className="h-4 w-4" />
                                </div>
                                <span className="font-bold">{selected.name}</span>
                            </>
                        ) : <span className="text-muted-foreground font-normal">Selecciona una categoría</span>}
                    </div>
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                    {filtered.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="p-1.5 rounded-full bg-black/5 flex items-center justify-center"
                                    style={{ color: cat.color }}
                                >
                                    <DynamicIcon name={cat.icon} className="h-4 w-4" />
                                </div>
                                <span className="font-semibold">{cat.name}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
