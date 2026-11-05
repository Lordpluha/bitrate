import { cn } from '@bitrate/ui-react'
import Markdown from 'react-markdown'

interface MarkdownTextProps {
  /** Markdown source, such as Bitrate review feedback. */
  children: string
  className?: string
}

/**
 * Renders staff-written Markdown. react-markdown never renders raw HTML and drops unsafe link
 * protocols; images are left out too, so the text can only carry formatting and links.
 */
export function MarkdownText({ children, className }: MarkdownTextProps) {
  return (
    <div
      className={cn(
        'min-w-0 text-sm leading-relaxed [overflow-wrap:anywhere]',
        '[&>*+*]:mt-3 [&_li+li]:mt-1',
        '[&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold',
        '[&_strong]:font-semibold [&_em]:italic [&_del]:line-through',
        '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
        '[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2',
        '[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-text-secondary',
        '[&_code]:rounded [&_code]:bg-secondary [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.8125em]',
        '[&_hr]:border-border',
        className,
      )}
    >
      <Markdown
        components={{
          a: ({ href, children: label }) => (
            <a href={href} rel="noopener noreferrer" target="_blank">
              {label}
            </a>
          ),
        }}
        disallowedElements={['img']}
        unwrapDisallowed
      >
        {children}
      </Markdown>
    </div>
  )
}
