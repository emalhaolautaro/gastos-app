import { Check } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Label } from '../../ui/label';
import { CATEGORY_COLORS } from '../../../data/colors';

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
    return (
        <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {CATEGORY_COLORS.map(c => (
                    <button
                        key={c}
                        onClick={() => onChange(c)}
                        className={cn(
                            "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center",
                            value === c ? "border-foreground scale-110 shadow-md" : "border-transparent"
                        )}
                        style={{ backgroundColor: c }}
                        type="button"
                    >
                        {value === c && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                    </button>
                ))}
            </div>
        </div>
    );
}
