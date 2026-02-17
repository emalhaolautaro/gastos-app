import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from './dialog';
import { Button } from './button';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'destructive' | 'default';
    onConfirm: () => void;
}

/**
 * Custom confirm dialog to replace native `confirm()` and `alert()`.
 * Native dialogs don't work properly in Tauri.
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'default',
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-[#ffe4e6] border-pink-200">
                <DialogHeader>
                    <DialogTitle className="font-bold text-lg">{title}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="bg-transparent border-black/20 hover:bg-black/5"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                        className={
                            variant === 'destructive'
                                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                : 'bg-black text-white hover:bg-gray-800'
                        }
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Hook to manage ConfirmDialog state.
 * Usage:
 *   const { confirm, dialogProps } = useConfirmDialog();
 *   confirm({ title, description, onConfirm });
 *   <ConfirmDialog {...dialogProps} />
 */
export function useConfirmDialog() {
    const [state, setState] = useState<{
        open: boolean;
        title: string;
        description: string;
        confirmLabel?: string;
        variant?: 'destructive' | 'default';
        onConfirm: () => void;
    }>({
        open: false,
        title: '',
        description: '',
        onConfirm: () => { },
    });

    const confirm = (opts: {
        title: string;
        description: string;
        confirmLabel?: string;
        variant?: 'destructive' | 'default';
        onConfirm: () => void;
    }) => {
        setState({ ...opts, open: true });
    };

    const dialogProps = {
        ...state,
        onOpenChange: (open: boolean) => setState(prev => ({ ...prev, open })),
    };

    return { confirm, dialogProps };
}
