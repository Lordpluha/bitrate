import type { SVGProps } from "react"

interface NoWifiIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
}

export const NoWifiIcon = ({
  primaryColor = "var(--fg-color, currentcolor)",
  ...props
}: NoWifiIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 56 50"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path
      stroke={primaryColor}
      strokeWidth={1.25}
      d="M28.02 43.9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM51.72 42.4l2.4-2.4c1.2-1.2 1.2-3 0-4.2s-3-1.2-4.2 0l-2.4 2.4-2.4-2.4c-1.2-1.2-3-1.2-4.2 0s-1.2 3 0 4.2l2.4 2.4-2.4 2.4c-1.2 1.2-1.2 3 0 4.2.6.6 1.5.9 2.1.9s1.5-.3 2.1-.9l2.4-2.4 2.4 2.4c.6.6 1.5.9 2.1.9s1.5-.3 2.1-.9c1.2-1.2 1.2-3 0-4.2zM28.02 23.5c-4.2 0-8.1 1.8-10.8 4.8-1.2 1.2-1.2 3 0 4.2s3 1.2 4.2 0c3.6-3.9 9.6-3.9 12.9 0 .6.6 1.5.9 2.1.9s1.5-.3 2.1-.9c1.2-1.2 1.2-3 0-4.2-2.4-3-6.3-4.8-10.5-4.8Z"
    />
    <path
      stroke={primaryColor}
      strokeWidth={1.25}
      d="M42.42 23.5c.6.6 1.2.9 2.1.9s1.5-.3 2.1-.9c1.2-1.2 1.2-3 0-4.2-5.1-4.8-11.7-7.5-18.3-7.5s-13.5 2.7-18.3 7.5c-1.2 1.2-1.2 3 0 4.2s3 1.2 4.2 0c3.9-3.9 9-6 14.4-6s9.6 2.1 13.8 6Z"
    />
    <path
      stroke={primaryColor}
      strokeWidth={1.25}
      d="M49.92 14.5c.6.6 1.2.9 2.1.9s1.5-.3 2.1-.9c1.2-1.2.9-3-.3-4.2C46.62 3.7 37.32.1 27.72.1S9.42 3.4 1.92 10c-1.2 1.2-1.2 3-.3 4.2 1.2 1.2 3 1.2 4.2.3 6.6-5.7 14.1-8.7 22.2-8.7s15.6 3 21.9 8.7Z"
    />
  </svg>
)
