import type { SVGProps } from 'react'

interface InstagramIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
  secondaryColor?: string
  color3?: string
  color4?: string
  color5?: string
  color6?: string
}

export const InstagramIcon = ({
  primaryColor = '#f9ed32',
  secondaryColor = '#ee2a7b',
  color3 = '#d22a8a',
  color4 = '#8b2ab2',
  color5 = '#1b2af0',
  color6 = '#002aff',
  ...props
}: InstagramIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <defs>
      <radialGradient
        id="instagram-icon-radial-gradient"
        cx={-578.95}
        cy={-837.6}
        r={197.06}
        gradientTransform="matrix(.75 0 0 .75 499.5 629.5)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor={primaryColor} />
        <stop offset={0.36} stopColor={secondaryColor} />
        <stop offset={0.44} stopColor={color3} />
        <stop offset={0.6} stopColor={color4} />
        <stop offset={0.83} stopColor={color5} />
        <stop offset={0.88} stopColor={color6} />
      </radialGradient>
      <style>{'.instagram-icon-cls-2{fill:#fff}'}</style>
    </defs>
    <g id="instagram-icon-_3-instagram" data-name="3-instagram">
      <rect
        width={64}
        height={64}
        rx={11.2}
        ry={11.2}
        style={{
          fill: 'url(#instagram-icon-radial-gradient)',
        }}
        transform="rotate(180 32 32)"
      />
      <path
        d="M44 56H20A12 12 0 0 1 8 44V20A12 12 0 0 1 20 8h24a12 12 0 0 1 12 12v24a12 12 0 0 1-12 12M20 12.8a7.21 7.21 0 0 0-7.2 7.2v24a7.21 7.21 0 0 0 7.2 7.2h24a7.21 7.21 0 0 0 7.2-7.2V20a7.21 7.21 0 0 0-7.2-7.2Z"
        className="instagram-icon-cls-2"
      />
      <path
        d="M32 45.6A13.6 13.6 0 1 1 45.6 32 13.61 13.61 0 0 1 32 45.6m0-22.4a8.8 8.8 0 1 0 8.8 8.8 8.81 8.81 0 0 0-8.8-8.8"
        className="instagram-icon-cls-2"
      />
      <circle cx={45.6} cy={19.2} r={2.4} className="instagram-icon-cls-2" />
    </g>
  </svg>
)
