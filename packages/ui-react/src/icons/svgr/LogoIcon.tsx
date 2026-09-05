import type { SVGProps } from 'react'

interface LogoIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
  secondaryColor?: string
  color3?: string
  color4?: string
  color5?: string
  color6?: string
}

export const LogoIcon = ({
  primaryColor = '#490ae5',
  secondaryColor = '#5515ef',
  color3 = '#6824f8',
  color4 = '#8037fb',
  color5 = '#9e4efb',
  color6 = '#c060fa',
  ...props
}: LogoIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Bitrate logo"
    viewBox="371 117 795 775"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <defs>
      <linearGradient id="logo-icon-a" x1="0%" x2="100%" y1="50%" y2="50%">
        <stop offset="0%" stopColor={primaryColor} />
        <stop offset="22%" stopColor={secondaryColor} />
        <stop offset="45%" stopColor={color3} />
        <stop offset="65%" stopColor={color4} />
        <stop offset="82%" stopColor={color5} />
        <stop offset="100%" stopColor={color6} />
      </linearGradient>
    </defs>
    <path
      fill="url(#logo-icon-a)"
      d="m399 145 1 1v4l1 1v3l2 4v3l1 1 2 8 3 5v2l7 14 2 2 1 3 2 2 4 7 6 7v1l5 5v1l15 15h1l4 4h1l7 6h1l5 4 5 2 2 2 12 6h2l5 3h2l3 2h3l1 1 6 1 4 2h4l1 1h4l1 1h5l1 1h8l1 1h378l1 1h6l1 1h5l1 1h3l4 2h3l3 2h2l3 2h2l8 4 2 2 3 1 6 5h1l15 15v1l3 3 1 3 2 2 4 8v2l1 1v2l2 4v3l1 1v5l1 1v15l-1 1v5l-1 1v3l-1 1-2 8-5 10-2 2-4 7-16 16h-1l-3 3h-1l-8 6-14 7h-2l-6 3h-3l-1 1h-3l-1 1h-3l-1 1-11 1-1 1H685l-1 1h-10l-1 1h-6l-1 1h-5l-1 1h-4l-1 1h-3l-1 1-8 1-1 1h-2l-1 1h-2l-1 1h-2l-1 1-8 2-8 4h-2l-26 13-2 2-8 4-6 5-7 4-11 9h-1l-16 15h-1l-2 2v1l-14 14v1l-7 7v1l-3 3v1l-3 3v1l-4 4v1l-6 7-3 6-8 11-1 3-2 2-4 8-2 2-16 32v2l-3 5v2l-3 5v2l-2 3v2l-3 5-1 5-2 3v2l-1 1v2l-1 1v2l-1 1v2l-1 1v2l-1 1v2l-1 1v2l-1 1v2l-1 1v2l-1 1v2l-2 4v3l-2 4v3l-2 4v3l-1 1v3l-2 4-1 8-1 1v3l-1 1v4l-1 1v3l-1 1v4l-1 1v4l-1 1v4l-1 1v5l-1 1v3l-1 1v6l-1 1v6l-1 1v5l-1 1v5l-1 1v3l3-4 3-6 3-3v-1l2-2 2-4 3-3v-1l3-3 2-4 4-4v-1l3-3v-1l3-3v-1l4-4v-1l4-4v-1l6-6v-1l4-4v-1l11-11v-1l42-42h1l9-9h1l6-6h1l6-6h1l10-9h1l3-3h1l4-4h1l11-9h1l6-5 7-4 3-3 6-3 2-2 6-3 10-7 7-3 2-2 22-11h2l12-6h2l1-1h2l1-1h2l6-3h3l4-2h3l1-1h3l1-1h4l1-1h3l1-1 12-1 1-1h9l1-1h188l1 1h4l4 2 7 1 1 1 8 2 3 2h2l6 3 2 2 7 3 2 2 3 1 3 3h1l3 3h1l5 5h1l12 13v1l5 6 8 16v2l1 1v2l2 4 1 10 1 1v13l-1 1v6l-1 1-1 7-4 8-1 4-2 2-1 3-2 2-2 4-3 3v1l-17 16h-1l-8 6-16 8h-2l-4 2h-3l-1 1h-3l-1 1h-3l-1 1h-5l-1 1h-7l-1 1H697l-1 1h-9l-1 1-12 1-1 1h-4l-1 1-7 1-4 2h-3l-1 1h-2l-1 1h-2l-1 1-8 2-3 2h-2l-7 4h-2l-14 7-5 4-3 1-2 2-8 4-3 3h-1l-7 6h-1l-4 4h-1l-4 4h-1l-24 24v1l-6 6v1l-3 3v1l-3 3v1l-3 3v1l-3 3v1l-4 5-1 3-6 8-6 12h413l1-1h12l1-1h7l1-1h6l1-1h4l1-1 9-1 1-1 7-1 4-2 7-1 1-1 5-1 3-2h2l1-1 5-1 3-2h2l7-4h2l10-5 2-2 7-3 10-7 3-1 3-3h1l3-3h1l3-3h1l3-3h1l20-19v-1l6-6v-1l9-10 1-3 8-11 2-5 2-2 6-12v-2l2-2v-2l2-3v-2l1-1 2-8 2-3v-3l2-4v-3l1-1v-3l1-1v-4l1-1v-3l1-1v-8l1-1v-8l1-1v-25l-1-1v-8l-1-1-1-12-1-1v-3l-1-1-1-7-2-4v-3l-2-3v-2l-1-1-1-5-3-5v-2l-7-14-2-2-1-3-2-2v-1l-2-2v-1l-2-2-4-7-10-11v-1l-12-12h-1l-12-11h-1l-7-6-3-1-5-4 7-6h1l3-3h1l4-4h1l16-15v-1l8-8v-1l8-9v-1l6-8 1-3 4-5 1-3 2-2 5-10v-2l4-7 1-5 2-3v-2l1-1v-2l2-4v-3l2-4v-3l1-1 1-10 1-1v-6l1-1v-9l1-1v-24l-1-1v-9l-1-1v-7l-1-1v-5l-1-1v-4l-1-1-1-7-1-1v-2l-2-4v-3l-1-1-2-8-2-3v-2l-2-3v-2l-10-20-2-2-2-5-2-2-4-7-3-3v-1l-3-3v-1l-4-4v-1l-5-5v-1l-22-22h-1l-9-8h-1l-3-3-7-4-6-5-12-6-2-2-10-5h-2l-7-4-5-1-3-2h-2l-1-1h-2l-1-1h-2l-1-1h-2l-1-1h-2l-4-2h-3l-1-1h-3l-1-1h-3l-1-1h-4l-1-1h-3l-1-1h-5l-1-1h-4l-1-1h-7l-1-1h-10l-1-1Z"
      shapeRendering="geometricPrecision"
    />
  </svg>
)
