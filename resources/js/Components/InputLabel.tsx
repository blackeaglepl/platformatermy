import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    disabled = false,
    className = '',
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string; disabled?: boolean }) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium text-gray-700 data-[disabled=true]:text-gray-300` +
                className
            }
            data-disabled={disabled}
        >
            {value ? value : children}
        </label>
    );
}
