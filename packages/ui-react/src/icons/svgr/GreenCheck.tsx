import type { SVGProps } from "react"

interface GreenCheckProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
}

export const GreenCheck = ({ primaryColor = "currentcolor", ...props }: GreenCheckProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 18"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path
      stroke={primaryColor}
      strokeLinecap="round"
      strokeWidth={2}
      d="m1 8.838 7.441 7.442L23 1.72"
    />
  </svg>
)
