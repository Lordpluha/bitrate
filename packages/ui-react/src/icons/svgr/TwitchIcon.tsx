import type { SVGProps } from 'react'

interface TwitchIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
  secondaryColor?: string
}

export const TwitchIcon = ({
  primaryColor = '#8652f6',
  secondaryColor = '#ffffff',
  ...props
}: TwitchIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 1"
    viewBox="0 0 512 512"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <rect width={412.22} height={412.22} x={49.89} y={49.89} fill={primaryColor} rx={55.43} />
    <path d="m186.98 132.09-49.42 48.58v176.9h59.45v49.11l48.58-48.58h39.61l89.24-87.38V132.09z" />
    <path
      fill={secondaryColor}
      d="M197.54 150.92v147.14h45.86v32.05l31.71-31.7h41.09l39.22-38.39.01-109.1z"
    />
    <path d="M251.23 185.42h19.71v58.79h-19.71zM305.79 185.42h19.71v58.79h-19.71z" />
  </svg>
)
