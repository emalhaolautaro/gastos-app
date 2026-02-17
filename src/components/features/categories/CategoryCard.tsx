import { Category } from '../../../types';
import { Button } from '../../ui/button';
import { DynamicIcon } from '../../ui/DynamicIcon';
import { Trash2, Edit2 } from 'lucide-react';

interface CategoryCardProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (id: number) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
            <div className="flex items-center gap-3">
                <div
                    className="p-2 rounded-full flex items-center justify-center h-10 w-10"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                    <DynamicIcon name={category.icon} className="h-5 w-5" />
                </div>
                <span className="font-bold">{category.name}</span>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(category.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        </div>
    );
}
