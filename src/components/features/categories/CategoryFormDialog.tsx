import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { TypeSelector } from '../shared/TypeSelector';
import { IconPicker } from './IconPicker';
import { ColorPicker } from './ColorPicker';

interface CategoryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingId: number | null;
    name: string;
    onNameChange: (name: string) => void;
    type: 'income' | 'expense';
    onTypeChange: (type: 'income' | 'expense') => void;
    icon: string;
    onIconChange: (icon: string) => void;
    color: string;
    onColorChange: (color: string) => void;
    onSave: () => void;
}

export function CategoryFormDialog({
    open,
    onOpenChange,
    editingId,
    name,
    onNameChange,
    type,
    onTypeChange,
    icon,
    onIconChange,
    color,
    onColorChange,
    onSave,
}: CategoryFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl w-[90vw] max-h-[85vh] overflow-y-auto bg-[#ffe4e6] border-pink-200">
                <DialogHeader>
                    <DialogTitle className="font-bold text-xl">
                        {editingId !== null ? 'Editar Categoría' : 'Nueva Categoría'}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Tipo</Label>
                        <TypeSelector value={type} onChange={onTypeChange} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre de la categoría</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                            placeholder="Ej: Gimnasio, Cafetería, etc."
                            className="bg-input-background border-orange-100 placeholder:text-gray-400"
                        />
                    </div>

                    <IconPicker value={icon} onChange={onIconChange} />
                    <ColorPicker value={color} onChange={onColorChange} />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent border-black/20 hover:bg-black/5">
                        Cancelar
                    </Button>
                    <Button onClick={onSave} className="bg-black text-white hover:bg-gray-800 shadow-md">
                        {editingId !== null ? 'Guardar Cambios' : 'Crear Categoría'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
