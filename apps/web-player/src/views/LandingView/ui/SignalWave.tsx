const quietSignal = [
  18, 28, 22, 38, 52, 42, 66, 34, 58, 76, 48, 30, 62, 84, 54, 40, 70, 46, 28,
  56, 78, 44, 64, 36,
].map((height, index) => ({
  height,
  id: `quiet-signal-${String(index).padStart(2, '0')}`,
}))
const wideSignal = [
  22, 31, 40, 29, 48, 67, 52, 36, 58, 76, 88, 54, 43, 66, 94, 72, 46, 62, 80,
  58, 38, 52, 70, 84, 61, 42, 56, 74, 63, 47, 33, 52, 68, 44, 30, 20,
].map((height, index) => ({
  height,
  id: `wide-signal-${String(index).padStart(2, '0')}`,
}))

interface SignalWaveProps {
  density?: 'quiet' | 'wide'
}

export function SignalWave({ density = 'wide' }: SignalWaveProps) {
  const values = density === 'quiet' ? quietSignal : wideSignal

  return (
    <div className="flex h-full w-full items-center gap-1" role="presentation">
      {values.map(({ height, id }) => (
        <span
          className="min-w-px flex-1 rounded-full bg-gradient-to-t from-blue-600 via-primary to-fuchsia-400 opacity-70"
          key={id}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  )
}
