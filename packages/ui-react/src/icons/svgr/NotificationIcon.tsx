import type { SVGProps } from 'react'

interface NotificationIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
}

export const NotificationIcon = ({ primaryColor = '#b3b3b3', ...props }: NotificationIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 17 16"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path
      fill={primaryColor}
      d="M8.57 1.5a3.997 3.997 0 0 0-3.998 3.997v3.268a.75.75 0 0 1-.1.373l-1.644 2.855H14.31l-1.644-2.856a.75.75 0 0 1-.1-.374V5.497A4 4 0 0 0 8.57 1.5M3.072 5.497a5.496 5.496 0 0 1 10.993 0v3.065l2.191 3.806a.75.75 0 0 1-.65 1.124h-4.54a2.498 2.498 0 0 1-4.996 0H1.53a.75.75 0 0 1-.65-1.124l2.192-3.804zm4.497 7.995a1 1 0 0 0 1.998 0z"
    />
  </svg>
)
