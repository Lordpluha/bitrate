import type { SVGProps } from "react"

interface HomeIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
}

export const HomeIcon = ({
  primaryColor = "var(--fg-color, currentcolor)",
  ...props
}: HomeIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path
      stroke={primaryColor}
      d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732z"
    />
  </svg>
)
