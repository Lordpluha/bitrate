<script lang="ts">
  type RangeInputVariant = 'seek' | 'volume'

  let {
    label,
    value,
    min,
    max,
    step,
    progress,
    variant,
    onInput,
  }: {
    label: string
    value: number
    min: string | number
    max: string | number
    step: string | number
    progress: number
    variant: RangeInputVariant
    onInput: (event: Event) => void
  } = $props()
</script>

<input
  aria-label={label}
  class={variant}
  {max}
  {min}
  oninput={onInput}
  {step}
  style={`--progress: ${progress}%`}
  type="range"
  {value}
/>

<style>
  input[type='range'] {
    appearance: none;
    -webkit-appearance: none;
    height: 0.25rem;
    border-radius: 9999px;
    background: linear-gradient(
      to right,
      var(--color-text, var(--color-primary, currentColor)) var(--progress, 0%),
      var(--color-border, currentColor) var(--progress, 0%)
    );
    cursor: pointer;
  }

  input[type='range']:focus-visible {
    outline: 2px solid var(--color-primary, currentColor);
    outline-offset: 2px;
  }

  input[type='range']::-webkit-slider-thumb {
    appearance: none;
    -webkit-appearance: none;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 9999px;
    background-color: var(--color-text, var(--color-primary, currentColor));
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  input[type='range']::-moz-range-thumb {
    width: 0.75rem;
    height: 0.75rem;
    border: none;
    border-radius: 9999px;
    background-color: var(--color-text, var(--color-primary, currentColor));
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  input[type='range']:hover::-webkit-slider-thumb,
  input[type='range']:focus-visible::-webkit-slider-thumb {
    opacity: 1;
  }

  input[type='range']:hover::-moz-range-thumb,
  input[type='range']:focus-visible::-moz-range-thumb {
    opacity: 1;
  }

  .seek {
    flex: 1 1 auto;
    min-width: 6rem;
  }

  .volume {
    width: 6rem;
  }
</style>
