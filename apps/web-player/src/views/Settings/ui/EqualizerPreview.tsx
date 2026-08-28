const frequencies = ['60Hz', '150Hz', '400Hz', '1KHz', '2.4KHz', '15KHz']

export const EqualizerPreview = () => (
  <div className="mx-auto mt-2 w-full max-w-180 overflow-x-auto rounded-lg bg-background-tinted custom-scrollbar">
    <div className="min-w-140 px-7 pb-7 pt-10">
      <div className="relative h-72">
        <span className="absolute left-0 top-0 text-sm font-bold text-text-subdued">
          +12dB
        </span>
        <span className="absolute bottom-9 left-0 text-sm font-bold text-text-subdued">
          -12dB
        </span>

        <div className="absolute bottom-12 left-14 right-2 top-3">
          <div className="absolute inset-0 grid grid-cols-6">
            {frequencies.map((label) => (
              <div
                className="relative border-l border-white/10 last:border-r"
                key={label}
              >
                <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-bold text-text-subdued">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute left-0 right-0 top-1/2 h-px bg-white/35" />
          <div className="absolute bottom-0 left-0 right-0 top-1/2 bg-gradient-to-b from-white/25 to-transparent" />
          <div className="absolute left-0 right-0 top-1/2 flex -translate-y-1/2 justify-between">
            {frequencies.map((label) => (
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-text"
                key={label}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)
