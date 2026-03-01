import type { SVGProps } from 'react'

interface RollupIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
}

export const RollupIcon = ({ primaryColor = '#b3b3b3', ...props }: RollupIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 16"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path
      fill={primaryColor}
      d="M5.026 10.524a.75.75 0 1 1-1.059-1.06l1.47-1.469-1.47-1.469a.75.75 0 0 1 1.06-1.06l1.998 2a.75.75 0 0 1 0 1.059z"
    />
    <path
      fill={primaryColor}
      d="M1 0a1 1 0 0 0-1 1v13.99a1 1 0 0 0 1 1h13.99a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1zm.499 1.499h7.995v12.992H1.499zm12.992 12.992h-3.498V1.499h3.498z"
    />
  </svg>
)
