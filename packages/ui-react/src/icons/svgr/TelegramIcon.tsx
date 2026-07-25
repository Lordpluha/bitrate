import type { SVGProps } from 'react'

interface TelegramIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
  secondaryColor?: string
  color3?: string
}

export const TelegramIcon = ({
  primaryColor = '#ffffff',
  secondaryColor = '#37aee2',
  color3 = '#1e96c8',
  ...props
}: TelegramIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 48 48"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path
      fill="url(#telegram-icon-a)"
      d="M24 48c13.255 0 24-10.745 24-24S37.255 0 24 0 0 10.745 0 24s10.745 24 24 24"
    />
    <path
      fill={primaryColor}
      d="M8.938 25.174c2.806-1.545 5.938-2.835 8.864-4.132 5.034-2.123 10.088-4.21 15.193-6.152.994-.331 2.778-.655 2.953.817-.095 2.084-.49 4.155-.76 6.226-.686 4.556-1.48 9.095-2.253 13.636-.267 1.512-2.161 2.295-3.373 1.327-2.913-1.968-5.849-3.916-8.725-5.93-.942-.957-.069-2.332.773-3.015 2.4-2.365 4.944-4.374 7.218-6.86.613-1.482-1.2-.234-1.797.149-3.285 2.263-6.49 4.665-9.952 6.655-1.77.973-3.831.141-5.6-.402-1.585-.657-3.908-1.318-2.54-2.319"
    />
    <defs>
      <linearGradient
        id="telegram-icon-a"
        x1={18.003}
        x2={6.003}
        y1={2.002}
        y2={30}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor={secondaryColor} />
        <stop offset={1} stopColor={color3} />
      </linearGradient>
    </defs>
  </svg>
)
