import type { SVGProps } from 'react'
import type React from 'react'

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
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 14 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <style>{'@keyframes wave{0%,100%{transform:scaleY(0.3)}25%{transform:scaleY(1)}75%{transform:scaleY(0.6)}}'}</style>
    <rect width={2} height={18} x={1}    y={3} fill={color} rx={1} style={barStyle('0s')}    />
    <rect width={2} height={22} x={4.5}  y={1} fill={color} rx={1} style={barStyle('0.25s')} />
    <rect width={2} height={20} x={8}    y={2} fill={color} rx={1} style={barStyle('0.5s')}  />
    <rect width={2} height={16} x={11.5} y={4} fill={color} rx={1} style={barStyle('0.15s')} />
  </svg>
)
