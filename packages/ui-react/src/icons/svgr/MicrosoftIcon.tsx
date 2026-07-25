import type { SVGProps } from 'react'

interface MicrosoftIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
  secondaryColor?: string
  color3?: string
  color4?: string
}

export const MicrosoftIcon = ({
  primaryColor = '#f25022',
  secondaryColor = '#7fba00',
  color3 = '#00a4ef',
  color4 = '#ffb900',
  ...props
}: MicrosoftIconProps) => (
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
    <path fill={primaryColor} d="M0 0h22.81v22.81H0z" />
    <path fill={secondaryColor} d="M25.19 0H48v22.81H25.19z" />
    <path fill={color3} d="M0 25.19h22.81V48H0z" />
    <path fill={color4} d="M25.19 25.19H48V48H25.19z" />
  </svg>
)
