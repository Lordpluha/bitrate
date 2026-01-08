import type { SVGProps } from "react";
interface ExpandIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
}

export const ExpandIcon = ({ primaryColor = "#b3b3b3", ...props }: ExpandIconProps) => <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 35 35" aria-hidden="true" focusable="false" {...props}><path fill={primaryColor} d="M16.01 18.954a.75.75 0 0 1 0 1.06l-2.717 2.718h1.017a.75.75 0 1 1 0 1.499h-3.576v-3.577a.75.75 0 1 1 1.5 0v1.017l2.718-2.718a.75.75 0 0 1 1.059 0m2.939-2.938a.75.75 0 0 1 0-1.06l2.718-2.718H20.65a.749.749 0 1 1 0-1.499h3.576v3.577a.75.75 0 0 1-1.5 0v-1.018l-2.718 2.718a.75.75 0 0 1-1.059 0" /></svg>;