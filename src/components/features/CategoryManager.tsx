import { useState } from 'react';
import * as Icons from 'lucide-react';
import { Category, Transaction } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';

interface CategoryManagerProps {
    categories: Category[];
    setCategories: (categories: Category[]) => void;
    transactions: Transaction[];
}

const AVAILABLE_ICONS = [
    // Essentials & Expenses
    'Utensils', 'Car', 'Home', 'Zap', 'Gamepad2', 'Heart', 'GraduationCap', 'ShoppingBag', 'ShoppingCart',
    'MoreHorizontal', 'Briefcase', 'Laptop', 'TrendingUp', 'TrendingDown', 'Gift', 'Smartphone', 'Tablet',
    'Wifi', 'Coffee', 'Music', 'Film', 'Book', 'Plane', 'Train', 'Bus', 'Truck', 'Bike', 'DollarSign',
    'CreditCard', 'PiggyBank', 'Landmark', 'Baby', 'Dog', 'Cat', 'Dumbbell', 'Stethoscope', 'Activity',
    'Shirt', 'Scissors', 'Hammer', 'Lightbulb', 'Cloud', 'Sun', 'Moon', 'Umbrella', 'Watch',
    'Megaphone', 'Bell', 'Mail', 'Map', 'MapPin', 'Navigation', 'Anchor', 'Rocket', 'Printer',
    'Apple', 'Banana', 'Cherry', 'Grape', 'Pizza', 'Beer', 'Wine', 'Droplet', 'Thermometer',

    // UI & Actions
    'Airplay', 'AlertCircle', 'AlertTriangle', 'AlignJustify', 'Aperture', 'Archive',
    'ArrowDownCircle', 'ArrowUpCircle', 'AtSign', 'Award', 'BarChart2', 'BatteryCharging',
    'Bluetooth', 'BookOpen', 'Box', 'Calendar', 'Camera', 'Cast', 'CheckCircle', 'ChevronRight',
    'Circle', 'Clipboard', 'Clock', 'Code', 'Codepen', 'Command', 'Compass', 'Copy', 'CornerDownRight',
    'Crop', 'Crosshair', 'Database', 'Disc', 'Divide', 'DivideCircle', 'Download', 'DownloadCloud',
    'Edit', 'Edit2', 'Edit3', 'ExternalLink', 'Eye', 'EyeOff', 'FastForward', 'Feather', 'File',
    'FileMinus', 'FilePlus', 'FileText', 'Filter', 'Flag', 'Folder', 'FolderMinus', 'FolderPlus',
    'Framer', 'Frown', 'GitBranch', 'GitCommit', 'GitMerge', 'GitPullRequest', 'Github', 'Globe',
    'Grid', 'HardDrive', 'Hash', 'Headphones', 'HelpCircle', 'Hexagon', 'Image', 'Inbox', 'Info',
    'Instagram', 'Italic', 'Key', 'Layers', 'Layout', 'LifeBuoy', 'Link', 'Link2', 'Linkedin',
    'List', 'Loader', 'Lock', 'LogIn', 'LogOut', 'Maximize', 'Maximize2', 'Meh', 'Menu',
    'MessageCircle', 'MessageSquare', 'Mic', 'MicOff', 'Minimize', 'Minimize2', 'Minus',
    'MinusCircle', 'MinusSquare', 'Monitor', 'MoreVertical', 'MousePointer', 'Move', 'Navigation2',
    'Octagon', 'Package', 'Paperclip', 'Pause', 'PauseCircle', 'PenTool', 'Percent', 'Phone',
    'PhoneCall', 'PhoneForwarded', 'PhoneIncoming', 'PhoneMissed', 'PhoneOff', 'PhoneOutgoing',
    'PieChart', 'Play', 'PlayCircle', 'Plus', 'PlusCircle', 'PlusSquare', 'Pocket', 'Power',
    'Radio', 'RefreshCcw', 'RefreshCw', 'Repeat', 'Rewind', 'RotateCcw', 'RotateCw', 'Rss',
    'Save', 'Search', 'Send', 'Server', 'Settings', 'Share', 'Share2', 'Shield', 'ShieldOff',
    'Shuffle', 'Sidebar', 'SkipBack', 'SkipForward', 'Slack', 'Slash', 'Sliders', 'Smile',
    'Speaker', 'Square', 'Star', 'StopCircle', 'Sunrise', 'Sunset', 'Tag', 'Target', 'Terminal',
    'ThumbsDown', 'ThumbsUp', 'ToggleLeft', 'ToggleRight', 'Tool', 'Trash', 'Trash2', 'Trello',
    'Triangle', 'Tv', 'Twitch', 'Twitter', 'Type', 'Underline', 'Unlock', 'Upload', 'UploadCloud',
    'User', 'UserCheck', 'UserMinus', 'UserPlus', 'UserX', 'Users', 'Video', 'VideoOff', 'Voicemail',
    'Volume', 'Volume1', 'Volume2', 'VolumeX', 'WifiOff', 'Wind', 'X', 'XCircle', 'XOctagon',
    'XSquare', 'Youtube', 'ZapOff', 'ZoomIn', 'ZoomOut'
];

const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4',
    '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#64748b',
    '#78716c', '#000000', '#7f1d1d', '#14532d', '#1e3a8a', '#4c1d95'
];

export function CategoryManager({ categories, setCategories, transactions }: CategoryManagerProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [icon, setIcon] = useState('MoreHorizontal');
    const [color, setColor] = useState('#9ca3af');

    const resetForm = () => {
        setName('');
        setType('expense');
        setIcon('MoreHorizontal');
        setColor('#9ca3af');
        setEditingId(null);
    };

    const handleOpenDialog = (category?: Category) => {
        if (category) {
            setName(category.name);
            setType(category.type);
            setIcon(category.icon);
            setColor(category.color);
            setEditingId(category.id);
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!name.trim()) return;

        if (editingId) {
            // Update existing
            setCategories(categories.map(c =>
                c.id === editingId
                    ? { ...c, name, type, icon, color }
                    : c
            ));
        } else {
            // Create new
            const newCategory: Category = {
                id: crypto.randomUUID(),
                name,
                type,
                icon,
                color,
            };
            setCategories([...categories, newCategory]);
        }
        setIsDialogOpen(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        const hasTransactions = transactions.some(t => t.categoryId === id);
        if (hasTransactions) {
            alert('No se puede eliminar una categoría que tiene transacciones asociadas.');
            return;
        }
        if (confirm('¿Estás seguro de eliminar esta categoría?')) {
            setCategories(categories.filter(c => c.id !== id));
        }
    };

    const IconComponent = ({ name, className }: { name: string, className?: string }) => {
        const Icon = (Icons as any)[name] || Icons.HelpCircle;
        return <Icon className={className} />;
    };

    // Render Logic helpers
    const renderCategoryList = (listType: 'income' | 'expense', title: string) => (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {categories.filter(c => c.type === listType).map(category => (
                    <div key={category.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div
                                className="p-2 rounded-full bg-opacity-20 flex items-center justify-center h-10 w-10"
                                style={{ backgroundColor: `${category.color}20`, color: category.color }}
                            >
                                <IconComponent name={category.icon} className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-base">{category.name}</span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(category)}>
                                <Edit2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-card p-6 rounded-lg shadow-sm border">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Categorías</h2>
                    <p className="text-muted-foreground font-medium text-base">Personaliza tus categorías de ingresos y gastos</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-[#fce4ec] text-pink-900 hover:bg-[#fce4ec]/90 shadow-md font-bold text-base border border-pink-200">
                    <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {renderCategoryList('expense', 'Categorías de Gastos')}
                {renderCategoryList('income', 'Categorías de Ingresos')}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl w-[90vw] max-h-[85vh] overflow-y-auto bg-[#ffe4e6] border-pink-200"> {/* Responsive width/height */}
                    <DialogHeader>
                        <DialogTitle className="font-bold text-xl">{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 gap-4 py-4"> {/* Reduced gap */}
                        <div className="space-y-2">
                            <Label className="font-bold text-base">Tipo</Label>
                            <div className="flex p-1 bg-[#fffbeb] rounded-lg border border-orange-100">
                                <button
                                    type="button"
                                    className={cn("flex-1 py-2 text-base font-bold rounded-md transition-all", type === 'expense' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
                                    onClick={() => setType('expense')}
                                >
                                    Gasto
                                </button>
                                <button
                                    type="button"
                                    className={cn("flex-1 py-2 text-base font-bold rounded-md transition-all", type === 'income' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
                                    onClick={() => setType('income')}
                                >
                                    Ingreso
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="font-bold text-base">Nombre de la categoría</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Gimnasio, Cafetería, etc." className="bg-[#fffbeb] border-orange-100 placeholder:text-gray-400 font-medium text-base" />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-base">Icono</Label>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-3 border border-orange-100 rounded-md bg-[#fffbeb] h-[160px] overflow-y-auto"> {/* Responsive Grid */}
                                {AVAILABLE_ICONS.map(iconName => (
                                    <button
                                        key={iconName}
                                        onClick={() => setIcon(iconName)}
                                        className={cn(
                                            "p-2 rounded-md hover:bg-white/60 transition-colors flex items-center justify-center",
                                            icon === iconName ? "bg-black text-white shadow-sm scale-110" : "text-gray-700"
                                        )}
                                        title={iconName}
                                        type="button"
                                    >
                                        <IconComponent name={iconName} className="h-5 w-5" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-base">Color</Label>
                            <div className="flex flex-wrap gap-3 justify-center sm:justify-start"> {/* Center colors on mobile */}
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        className={cn(
                                            "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center",
                                            color === c ? "border-foreground scale-110 shadow-md" : "border-transparent"
                                        )}
                                        style={{ backgroundColor: c }}
                                        type="button"
                                    >
                                        {color === c && <Icons.Check className="h-4 w-4 text-white drop-shadow-md" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-transparent border-black/20 hover:bg-black/5">Cancelar</Button>
                        <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800 shadow-md">
                            {editingId ? 'Guardar Cambios' : 'Crear Categoría'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
