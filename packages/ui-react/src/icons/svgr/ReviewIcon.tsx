import type { SVGProps } from 'react'

interface ReviewIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
}

export const ReviewIcon = ({ primaryColor = '#b3b3b3', ...props }: ReviewIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 25"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path
      fill={primaryColor}
      d="M15 16.02c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .896 3 2"
    />
    <path
      fill={primaryColor}
      d="M1.515 9.89a1 1 0 0 1 .778-.37H21.71a1 1 0 0 1 .979 1.209l-2.34 11a1 1 0 0 1-.977.791H4.632a1 1 0 0 1-.978-.791l-2.34-11a1 1 0 0 1 .202-.837zm2.012 1.63 1.913 9h13.123l1.913-9zm.475-9a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4h-2v-3h-12v3h-2z"
    />
  </svg>
)
