import { FC, ReactNode, Ref } from 'react';
import { type InputProps } from './input';
export interface PasswordInputProps extends Omit<InputProps, 'type'> {
    showPassword?: boolean;
    onTogglePassword?: () => void;
    showIcon?: ReactNode;
    hideIcon?: ReactNode;
    ref?: Ref<HTMLInputElement>;
}
declare const PasswordInput: FC<PasswordInputProps>;
export { PasswordInput };
