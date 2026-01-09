import type { SVGProps } from "react"

interface TwitIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
}

export const TwitIcon = ({
  primaryColor = "var(--fg-color, currentcolor)",
  ...props
}: TwitIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 56 56"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path
      stroke={primaryColor}
      strokeWidth={1.25}
      d="M43.641 18.299c-1.15.51-2.388.855-3.686 1.01a6.43 6.43 0 0 0 2.822-3.551 12.9 12.9 0 0 1-4.076 1.558 6.418 6.418 0 0 0-10.935 5.853 18.22 18.22 0 0 1-13.229-6.705 6.4 6.4 0 0 0-.869 3.227 6.41 6.41 0 0 0 2.855 5.342 6.4 6.4 0 0 1-2.907-.803v.08a6.42 6.42 0 0 0 5.148 6.294 6.45 6.45 0 0 1-2.898.109 6.425 6.425 0 0 0 5.994 4.457 12.88 12.88 0 0 1-7.97 2.747q-.778 0-1.531-.09a18.16 18.16 0 0 0 9.838 2.884c11.805 0 18.26-9.78 18.26-18.26q0-.418-.018-.831a13 13 0 0 0 3.202-3.321Z"
    />
  </svg>
)
