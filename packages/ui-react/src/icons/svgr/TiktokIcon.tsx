import type { SVGProps } from 'react'

interface TiktokIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
  secondaryColor?: string
  color3?: string
  color4?: string
  color5?: string
  color6?: string
  color7?: string
  color8?: string
  color9?: string
  color10?: string
  color11?: string
  color12?: string
}

export const TiktokIcon = ({
  primaryColor = '#111111',
  secondaryColor = '#323232',
  color3 = '#b5053c',
  color4 = '#c90441',
  color5 = '#f0014b',
  color6 = '#ff004f',
  color7 = '#00b2c9',
  color8 = '#00c8d4',
  color9 = '#00e6e4',
  color10 = '#00f1ea',
  color11 = '#dde3e4',
  color12 = '#fcf7f7',
  ...props
}: TiktokIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 1"
    viewBox="0 0 512 512"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <defs>
      <linearGradient
        id="tiktok-icon-a"
        x1={-1.347}
        x2={510.699}
        y1={513.347}
        y2={1.301}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor={primaryColor} />
        <stop offset={1} stopColor={secondaryColor} />
      </linearGradient>
      <linearGradient
        id="tiktok-icon-b"
        x1={153.06}
        x2={368.112}
        y1={376.967}
        y2={161.914}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor={color3} />
        <stop offset={0.233} stopColor={color4} />
        <stop offset={0.737} stopColor={color5} />
        <stop offset={1} stopColor={color6} />
      </linearGradient>
      <linearGradient
        id="tiktok-icon-c"
        x1={136.192}
        x2={362.722}
        y1={366.084}
        y2={139.555}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor={color7} />
        <stop offset={0.283} stopColor={color8} />
        <stop offset={0.741} stopColor={color9} />
        <stop offset={1} stopColor={color10} />
      </linearGradient>
      <linearGradient
        id="tiktok-icon-d"
        x1={9.279}
        x2={510.704}
        y1={506.873}
        y2={5.448}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor={color11} />
        <stop offset={1} stopColor={color12} />
      </linearGradient>
    </defs>
    <path
      d="M256 0C114.615 0 0 114.615 0 256s114.615 256 256 256 256-114.615 256-256S397.385 0 256 0"
      style={{
        fill: 'url(#tiktok-icon-a)',
      }}
    />
    <path
      d="M393.729 187.531a72.364 72.364 0 0 1-72.365-72.364h-51.7v202.448a43.964 43.964 0 1 1-31.547-42.221v-50.256a93.308 93.308 0 1 0 80.839 92.477l1.5-102.332a123.5 123.5 0 0 0 73.267 23.946Z"
      style={{
        fill: 'url(#tiktok-icon-b)',
      }}
    />
    <path
      d="M380.062 173.448a72.364 72.364 0 0 1-72.362-72.365H256v202.448a43.964 43.964 0 1 1-31.547-42.22v-50.257a93.308 93.308 0 1 0 80.839 92.477L306.8 201.2a123.5 123.5 0 0 0 73.267 23.945Z"
      style={{
        fill: 'url(#tiktok-icon-c)',
      }}
    />
    <path
      d="M380.062 186.237a72.36 72.36 0 0 1-44.615-28.176 72.35 72.35 0 0 1-26.375-42.894h-39.405v202.448a44.015 44.015 0 0 1-81.653 22.815 44.018 44.018 0 0 1 36.439-79.119v-36.983a93.3 93.3 0 0 0-72.236 150.841 93.3 93.3 0 0 0 153.075-71.638L306.8 201.2a123.5 123.5 0 0 0 73.267 23.945Z"
      style={{
        fill: 'url(#tiktok-icon-d)',
      }}
    />
  </svg>
)
