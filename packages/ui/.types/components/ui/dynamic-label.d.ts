import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const labelVariants: (props?: ({
    variant?: "default" | "contrast" | "search" | null | undefined;
    state?: "idle" | "floating" | null | undefined;
    focused?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface DynamicLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement>, Omit<VariantProps<typeof labelVariants>, 'state' | 'focused'> {
    children: React.ReactNode;
}
export declare const DynamicLabel: React.FC<DynamicLabelProps>;
export { labelVariants };
