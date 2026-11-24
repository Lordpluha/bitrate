import { ThemedText } from '@/components/themed-text'

/** A section title inside a screen; marked as a header for screen-reader navigation. */
export function SectionHeader({ title }: { title: string }) {
  return (
    <ThemedText accessibilityRole="header" variant="heading">
      {title}
    </ThemedText>
  )
}
