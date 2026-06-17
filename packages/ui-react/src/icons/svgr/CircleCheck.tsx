import type { SVGProps } from 'react'

interface CircleCheckProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
}

export const CircleCheck = ({ primaryColor = '#0f7bd0', ...props }: CircleCheckProps) => (
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
      d="M320 576C178.6 576 64 461.4 64 320S178.6 64 320 64s256 114.6 256 256-114.6 256-256 256m118-366.3c-10.7-7.8-25.7-5.4-33.5 5.3L285.1 379.2 233 327.1c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l72 72c5 5 11.8 7.5 18.8 7s13.4-4.1 17.5-9.8l135.9-187c7.8-10.7 5.4-25.7-5.3-33.5"
    />
  </svg>
)
