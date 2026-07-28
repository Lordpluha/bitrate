import type React from 'react'
import type { SVGProps } from 'react'

const barStyle = (delay: string): React.CSSProperties => ({
  animation: 'wave 1.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
  transformOrigin: 'center bottom',
  animationDelay: delay,
})

export const WaveAnimated = ({
  color = '#1db954',
  ...props
}: SVGProps<SVGSVGElement> & { color?: string }) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="18"
    viewBox="0 0 14 24"
    width="18"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <style>
      {
        '@keyframes wave{0%,100%{transform:scaleY(0.3)}25%{transform:scaleY(1)}75%{transform:scaleY(0.6)}}'
      }
    </style>
    <rect
      fill={color}
      height={18}
      rx={1}
      style={barStyle('0s')}
      width={2}
      x={1}
      y={3}
    />
    <rect
      fill={color}
      height={22}
      rx={1}
      style={barStyle('0.25s')}
      width={2}
      x={4.5}
      y={1}
    />
    <rect
      fill={color}
      height={20}
      rx={1}
      style={barStyle('0.5s')}
      width={2}
      x={8}
      y={2}
    />
    <rect
      fill={color}
      height={16}
      rx={1}
      style={barStyle('0.15s')}
      width={2}
      x={11.5}
      y={4}
    />
  </svg>
)
