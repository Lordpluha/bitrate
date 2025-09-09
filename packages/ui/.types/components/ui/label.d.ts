import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { type VariantProps } from 'class-variance-authority';
declare const labelVariants: (props?: ({
    variant?: "default" | "modal" | "large" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
declare const Label: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants> & React.RefAttributes<React.ElementRef<typeof LabelPrimitive.Root>>>;
export { Label };
