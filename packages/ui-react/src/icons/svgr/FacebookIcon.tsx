import type { SVGProps } from 'react'

interface FacebookIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
  secondaryColor?: string
}

export const FacebookIcon = ({
  primaryColor = '#1877f2',
  secondaryColor = '#ffffff',
  ...props
}: FacebookIconProps) => (
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
      fill={primaryColor}
      d="M48 24C48 10.744 37.256 0 24 0S0 10.744 0 24c0 11.981 8.775 21.91 20.25 23.71V30.937h-6.094V24h6.094v-5.288c0-6.014 3.581-9.337 9.066-9.337 2.625 0 5.372.469 5.372.469v5.906h-3.029c-2.98 0-3.909 1.852-3.909 3.75V24h6.656l-1.064 6.938H27.75v16.771C39.225 45.91 48 35.981 48 24"
    />
    <path
      fill={secondaryColor}
      d="M33.342 30.938 34.406 24H27.75v-4.5c0-1.898.928-3.75 3.91-3.75h3.028V9.844s-2.747-.469-5.372-.469c-5.485 0-9.066 3.323-9.066 9.337V24h-6.094v6.938h6.094v16.771Q22.086 48 24 48q1.914-.001 3.75-.29V30.937z"
    />
  </svg>
)
