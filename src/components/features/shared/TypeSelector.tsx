import { cn } from '../../../lib/utils';

interface TypeSelectorProps {
    value: 'income' | 'expense';
    onChange: (type: 'income' | 'expense') => void;
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
    return (
        <div className="flex p-1 bg-white/50 rounded-lg border">
            <button
                type="button"
                className={cn(
                    "flex-1 py-2 rounded-md transition-all",
                    value === 'expense'
                        ? "bg-black text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onChange('expense')}
            >
                Gasto
            </button>
            <button
                type="button"
                className={cn(
                    "flex-1 py-2 rounded-md transition-all",
                    value === 'income'
                        ? "bg-black text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onChange('income')}
            >
                Ingreso
            </button>
        </div>
    );
}
