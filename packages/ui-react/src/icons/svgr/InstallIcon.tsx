import type { SVGProps } from "react";
interface InstallIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
}

export const InstallIcon = ({ primaryColor = "#b3b3b3", ...props }: InstallIconProps) => <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 17 16" aria-hidden="true" focusable="false" {...props}><path fill={primaryColor} d="M5.919 8.745a.75.75 0 0 1 1.06 0l1.195 1.194V4a.75.75 0 0 1 1.5 0v5.94l1.195-1.195a.749.749 0 1 1 1.06 1.06l-3.005 3.006-.528-.528-.005-.005-2.472-2.473a.75.75 0 0 1 0-1.06" /><path fill={primaryColor} d="M.922 8a8 8 0 1 1 16 0 8 8 0 0 1-16 0m8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13" /></svg>;