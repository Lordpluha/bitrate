import { Fragment, type ReactNode } from 'react'

interface InterpolateProps {
  /** A translated message whose `{name}` placeholders mark where elements go. */
  message: string
  values: Record<string, ReactNode>
}

/**
 * Renders a translated sentence with links or other elements inside it, so each language
 * keeps its own word order instead of the sentence being split into fixed fragments.
 */
export function Interpolate({ message, values }: InterpolateProps) {
  // Splitting on a capturing group keeps the placeholder names at the odd indexes.
  return message.split(/\{(\w+)\}/g).map((part, index) => {
    const key = `${index}-${part}`
    if (index % 2 === 0) return <Fragment key={key}>{part}</Fragment>
    return (
      <Fragment key={key}>
        {part in values ? values[part] : `{${part}}`}
      </Fragment>
    )
  })
}
