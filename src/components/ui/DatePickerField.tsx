import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';

interface DatePickerFieldProps {
    label?: string;
    value: Date | null;
    onChange: (date: Date) => void;
}

export function DatePickerField({ label = 'Fecha', value, onChange }: DatePickerFieldProps) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <DatePicker
                label={label}
                value={value ? dayjs(value) : null}
                onChange={(newValue: Dayjs | null) => {
                    if (newValue) onChange(newValue.toDate());
                }}
                slotProps={{
                    textField: {
                        fullWidth: true,
                        size: 'small',
                    },
                }}
            />
        </LocalizationProvider>
    );
}
