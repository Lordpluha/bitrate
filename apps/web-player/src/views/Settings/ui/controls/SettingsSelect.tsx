import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bitrate/ui-react'

type SettingsSelectOption<TValue extends string> = {
  label: string
  value: TValue
}

type SettingsSelectProps<TValue extends string> = {
  ariaLabel: string
  onChange: (value: TValue) => void
  options: ReadonlyArray<SettingsSelectOption<TValue>>
  value: TValue
}

/** A setting row's choice as the design's kit Select: 200px wide, 150px on phones. */
export const SettingsSelect = <TValue extends string>({
  ariaLabel,
  onChange,
  options,
  value,
}: SettingsSelectProps<TValue>) => (
  <Select
    items={options}
    onValueChange={(next) => {
      const option = options.find((candidate) => candidate.value === next)
      if (option) onChange(option.value)
    }}
    value={value}
  >
    <SelectTrigger aria-label={ariaLabel} className="w-37.5 md:w-50">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)
