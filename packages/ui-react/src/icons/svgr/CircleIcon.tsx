import type { SVGProps } from 'react'

interface CircleIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
}

export const CircleIcon = ({ primaryColor = '#0f7bd0', ...props }: CircleIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path
      fill={primaryColor}
      d="M528 320c0-114.9-93.1-208-208-208s-208 93.1-208 208 93.1 208 208 208 208-93.1 208-208m-464 0C64 178.6 178.6 64 320 64s256 114.6 256 256-114.6 256-256 256S64 461.4 64 320"
    />
  </svg>
)
