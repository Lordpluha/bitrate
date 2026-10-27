<script lang="ts">
  import type { Snippet } from 'svelte'

  type IconButtonVariant = 'icon' | 'play'

  let {
    label,
    pressed,
    active = false,
    disabled = false,
    variant = 'icon',
    onClick,
    children,
  }: {
    label: string
    pressed?: boolean
    active?: boolean
    disabled?: boolean
    variant?: IconButtonVariant
    onClick: () => void
    children: Snippet
  } = $props()
</script>

<button
  aria-label={label}
  aria-pressed={pressed}
  class={variant === 'play' ? 'play-button' : 'icon-button'}
  class:icon-button--active={variant === 'icon' && active}
  {disabled}
  onclick={onClick}
  type="button"
>
  {@render children()}
</button>

<style>
  button {
    font: inherit;
    cursor: pointer;
    border: none;
    background: none;
    color: inherit;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  button:focus-visible {
    outline: 2px solid var(--color-primary, currentColor);
    outline-offset: 2px;
  }

  .icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--bitrate-player-icon-button-size, 2rem);
    height: var(--bitrate-player-icon-button-size, 2rem);
    border-radius: 9999px;
    color: var(--color-text-subdued, var(--color-muted-foreground, inherit));
    transition:
      color 0.15s ease,
      transform 0.15s ease;
  }

  .icon-button:hover:not(:disabled) {
    color: var(--color-text, var(--color-foreground, inherit));
    transform: scale(1.1);
  }

  .icon-button--active {
    color: var(--bitrate-player-accent, var(--color-success, mediumseagreen));
  }

  .icon-button--active:hover:not(:disabled) {
    color: var(--bitrate-player-accent, var(--color-success, mediumseagreen));
  }

  .play-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--bitrate-player-play-size, 2rem);
    height: var(--bitrate-player-play-size, 2rem);
    border-radius: 9999px;
    background-color: var(
      --bitrate-player-play-background,
      var(--color-text, var(--color-primary, currentColor))
    );
    color: var(
      --bitrate-player-play-foreground,
      var(--color-background, var(--color-primary-foreground, inherit))
    );
    transition: transform 0.15s ease;
  }

  .play-button:hover:not(:disabled) {
    transform: scale(1.05);
  }

  /** The icons carry fixed pixel sizes; larger layouts scale them rather than resize them. */
  .icon-button :global(svg) {
    scale: var(--bitrate-player-icon-scale, 1);
  }

  .play-button :global(svg) {
    scale: var(--bitrate-player-play-icon-scale, 1);
  }
</style>
