import type { SVGProps } from "react"

interface PlayIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
  secondaryColor?: string
}

export const PlayIcon = ({
  primaryColor = "#1ed760",
  secondaryColor = "#000000",
  ...props
}: PlayIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 48 49"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <rect width={48} height={48} y={0.42} fill={primaryColor} rx={24} />
    <path
      fill={secondaryColor}
      d="m19.05 16.026 13.49 7.788a.7.7 0 0 1 0 1.212l-13.49 7.788a.7.7 0 0 1-1.05-.606V16.632a.7.7 0 0 1 1.05-.606"
    />
  </svg>
)
