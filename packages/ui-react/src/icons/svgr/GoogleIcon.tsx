import type { SVGProps } from 'react'

interface GoogleIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
  secondaryColor?: string
  color3?: string
  color4?: string
}

export const GoogleIcon = ({
  primaryColor = '#eb4132',
  secondaryColor = '#fbbd01',
  color3 = '#31aa52',
  color4 = '#4086f4',
  ...props
}: GoogleIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 25 24"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path
      fill={primaryColor}
      d="M12.722 5.977a5.4 5.4 0 0 1 3.823 1.496l2.868-2.868A9.6 9.6 0 0 0 12.723 2a10 10 0 0 0-8.938 5.51l3.341 2.59a5.96 5.96 0 0 1 5.596-4.123"
    />
    <path
      fill={secondaryColor}
      d="M3.785 7.51a10.01 10.01 0 0 0 0 8.98l3.34-2.59a5.9 5.9 0 0 1 0-3.8z"
    />
    <path
      fill={color3}
      d="M16.108 17.068A6.033 6.033 0 0 1 7.126 13.9l-3.34 2.59A10 10 0 0 0 12.721 22a9.55 9.55 0 0 0 6.618-2.423z"
    />
    <path
      fill={color4}
      d="M22.14 10.182h-9.418v3.868h5.382a4.6 4.6 0 0 1-1.996 3.018l3.232 2.51a9.75 9.75 0 0 0 2.982-7.35q0-1.031-.182-2.046"
    />
  </svg>
)
