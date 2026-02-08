import type { SVGProps } from 'react'

interface FacebookIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
}

export const FacebookIcon = ({
  primaryColor = 'var(--fg-color, currentcolor)',
  ...props
}: FacebookIconProps) => (
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
      d="M30.531 24.625h5.063v5.063H30.53V41.5H25.47V29.688h-5.063v-5.063h5.063v-2.118c0-2.006.63-4.54 1.886-5.926q1.884-2.083 4.702-2.081h3.537v5.063H32.05c-.84 0-1.519.678-1.519 1.517z"
    />
  </svg>
)
