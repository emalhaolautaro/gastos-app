import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { formatCurrency } from '../../../lib/utils';

interface ExchangeRateFieldProps {
    amount: number;
    exchangeRate: number | undefined;
    onExchangeRateChange: (rate: number) => void;
}

export function ExchangeRateField({ amount, exchangeRate, onExchangeRateChange }: ExchangeRateFieldProps) {
    return (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md space-y-2 animate-in fade-in zoom-in-95">
            <Label className="text-amber-700 font-bold">Cotización del Dólar (ARS)</Label>
            <Input
                type="number"
                step="0.01"
                placeholder="Ej: 1100"
                value={exchangeRate || ''}
                onChange={(e) => onExchangeRateChange(parseFloat(e.target.value) || 0)}
                className="bg-white border-amber-200"
            />
            {amount > 0 && exchangeRate && exchangeRate > 0 && (
                <div className="text-sm text-amber-700 font-bold flex justify-between">
                    <span>Conversión estimada:</span>
                    <span>{formatCurrency(amount * exchangeRate, 'ARS')}</span>
                </div>
            )}
        </div>
    );
}
