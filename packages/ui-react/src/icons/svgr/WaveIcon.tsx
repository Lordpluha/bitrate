import type { SVGProps } from "react"

interface WaveIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
}

export const WaveIcon = ({ primaryColor = "#1db954", ...props }: WaveIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <style>{"@keyframes wave{0%,to{transform:scaleY(1)}50%{transform:scaleY(.5)}}"}</style>
    <rect width={2} height={16} x={1} y={4} fill={primaryColor} rx={1} />
    <rect width={2} height={20} x={4.5} y={2} fill={primaryColor} rx={1} />
    <rect width={2} height={18} x={8} y={3} fill={primaryColor} rx={1} />
    <rect width={2} height={14} x={11.5} y={5} fill={primaryColor} rx={1} />
  </svg>
)
