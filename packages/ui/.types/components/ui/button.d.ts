import { type VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, FC, Ref } from 'react';
export declare const buttonVariants: (props?: ({
    variant?: "default" | "destructive" | "outline" | "secondary" | "primary" | "contrast" | "subscribe" | "ghost" | "link" | null | undefined;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
    disabled?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Omit<VariantProps<typeof buttonVariants>, 'disabled'> {
    ref?: Ref<HTMLButtonElement>;
    isLoading?: boolean;
}
export declare const Button: FC<ButtonProps>;
