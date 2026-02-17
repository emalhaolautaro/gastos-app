/**
 * Formats a number into a compact string for chart axis labels.
 * Examples: 1500 → "$1.5k", 2300000 → "$2.3M", 1000000000 → "$1B"
 * Only for display purposes, never for storing values.
 */
export function formatCompact(value: number): string {
    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (abs >= 1_000_000_000) {
        const n = abs / 1_000_000_000;
        return `${sign}$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}B`;
    }
    if (abs >= 1_000_000) {
        const n = abs / 1_000_000;
        return `${sign}$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}M`;
    }
    if (abs >= 1_000) {
        const n = abs / 1_000;
        return `${sign}$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}k`;
    }

    return `${sign}$${abs}`;
}
