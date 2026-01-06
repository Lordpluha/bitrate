import type { SVGProps } from "react";
interface DownloadIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
  secondaryColor?: string
}

export const DownloadIcon = ({ primaryColor = "var(--bg-color, currentcolor)", secondaryColor = "var(--fg-color, currentcolor)", ...props }: DownloadIconProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 36 36" width="1em" height="1em" aria-hidden="true" focusable="false" {...props}><rect width={36} height={36} fill={primaryColor} rx={18} /><path stroke={secondaryColor} strokeWidth={1.25} d="m10.99 25.01 14.02-14.02m0 0-7.369-.054m7.37.054.053 7.369" /></svg>;