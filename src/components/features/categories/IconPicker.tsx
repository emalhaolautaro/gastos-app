import { cn } from '../../../lib/utils';
import { DynamicIcon } from '../../ui/DynamicIcon';
import { Label } from '../../ui/label';
import { AVAILABLE_ICONS } from '../../../data/icons';

interface IconPickerProps {
    value: string;
    onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
    return (
        <div className="space-y-2">
            <Label>Icono</Label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-3 border border-orange-100 rounded-md bg-input-background h-[160px] overflow-y-auto">
                {AVAILABLE_ICONS.map(iconName => (
                    <button
                        key={iconName}
                        onClick={() => onChange(iconName)}
                        className={cn(
                            "p-2 rounded-md hover:bg-white/60 transition-colors flex items-center justify-center",
                            value === iconName ? "bg-black text-white shadow-sm scale-110" : "text-gray-700"
                        )}
                        title={iconName}
                        type="button"
                    >
                        <DynamicIcon name={iconName} className="h-5 w-5" />
                    </button>
                ))}
            </div>
        </div>
    );
}
