import * as Icons from 'lucide-react';

interface DynamicIconProps {
    name: string;
    className?: string;
}

/**
 * Renders a lucide-react icon dynamically by its string name.
 * Falls back to HelpCircle if the icon name is not found.
 */
export function DynamicIcon({ name, className }: DynamicIconProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Icon = (Icons as any)[name] || Icons.HelpCircle;
    return <Icon className={className} />;
}
