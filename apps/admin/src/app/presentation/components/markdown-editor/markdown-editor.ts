import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core'
import { TranslocoPipe } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideBold,
  lucideCode,
  lucideHeading2,
  lucideItalic,
  lucideLink,
  lucideList,
  lucideListOrdered,
  lucideStrikethrough,
  lucideTextQuote,
} from '@ng-icons/lucide'
import { MarkdownPipe } from '@presentation/pipes'

/** Wraps the selection, such as `**bold**`; an empty selection gets `placeholder` selected. */
type InlineFormat = { kind: 'inline'; before: string; after: string; placeholder: string }
/** Prefixes every selected line, such as `- ` for a list item. */
type LineFormat = { kind: 'line'; prefix: (index: number) => string }
type Format = InlineFormat | LineFormat

type ToolKey =
  | 'bold'
  | 'italic'
  | 'strike'
  | 'heading'
  | 'bulletList'
  | 'numberedList'
  | 'quote'
  | 'code'
  | 'link'

type Tool = { key: ToolKey; icon: string; format: Format }

const TOOLS: readonly Tool[] = [
  { key: 'bold', icon: 'lucideBold', format: inline('**', '**', 'bold') },
  { key: 'italic', icon: 'lucideItalic', format: inline('_', '_', 'italic') },
  { key: 'strike', icon: 'lucideStrikethrough', format: inline('~~', '~~', 'text') },
  { key: 'heading', icon: 'lucideHeading2', format: line(() => '### ') },
  { key: 'bulletList', icon: 'lucideList', format: line(() => '- ') },
  { key: 'numberedList', icon: 'lucideListOrdered', format: line((index) => `${index + 1}. `) },
  { key: 'quote', icon: 'lucideTextQuote', format: line(() => '> ') },
  { key: 'code', icon: 'lucideCode', format: inline('`', '`', 'code') },
  { key: 'link', icon: 'lucideLink', format: inline('[', '](https://)', 'link') },
]

/** Keyboard shortcuts, as on most forums and editors: Ctrl/⌘ + key. */
const SHORTCUTS: Readonly<Record<string, ToolKey>> = { b: 'bold', i: 'italic', k: 'link' }

function inline(before: string, after: string, placeholder: string): InlineFormat {
  return { kind: 'inline', before, after, placeholder }
}

function line(prefix: (index: number) => string): LineFormat {
  return { kind: 'line', prefix }
}

/**
 * A Markdown textarea with a forum-style formatting toolbar and a preview tab. The value is plain
 * Markdown; the preview renders it the way the artist will see it.
 */
@Component({
  selector: 'app-markdown-editor',
  imports: [NgIcon, TranslocoPipe, MarkdownPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideBold,
      lucideCode,
      lucideHeading2,
      lucideItalic,
      lucideLink,
      lucideList,
      lucideListOrdered,
      lucideStrikethrough,
      lucideTextQuote,
    }),
  ],
  host: {
    class:
      'block overflow-hidden rounded-xl border border-glass-line bg-foreground/5 transition-[border-color,box-shadow] focus-within:border-primary/60 focus-within:ring-3 focus-within:ring-primary/20',
  },
  template: `
    <div class="flex flex-wrap items-center gap-1 border-b border-glass-line px-1.5 py-1">
      <div
        class="flex flex-wrap items-center gap-0.5"
        role="toolbar"
        [attr.aria-label]="'ui.markdown.toolbar' | transloco"
        [attr.aria-controls]="inputId()"
      >
        @for (tool of tools; track tool.key) {
          <button
            class="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-40"
            type="button"
            [attr.aria-label]="'ui.markdown.' + tool.key | transloco"
            [attr.title]="'ui.markdown.' + tool.key | transloco"
            [disabled]="disabled() || preview()"
            (click)="apply(tool.key)"
          >
            <ng-icon class="text-base" aria-hidden="true" [name]="tool.icon" />
          </button>
        }
      </div>
      <div class="ms-auto flex gap-0.5 rounded-lg bg-foreground/5 p-0.5 text-xs">
        <button
          class="rounded-md px-2.5 py-1 transition-colors"
          type="button"
          [class]="preview() ? 'text-muted-foreground' : 'bg-background text-foreground shadow-sm'"
          [attr.aria-pressed]="!preview()"
          (click)="preview.set(false)"
        >
          {{ 'ui.markdown.write' | transloco }}
        </button>
        <button
          class="rounded-md px-2.5 py-1 transition-colors"
          type="button"
          [class]="preview() ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'"
          [attr.aria-pressed]="preview()"
          (click)="preview.set(true)"
        >
          {{ 'ui.markdown.preview' | transloco }}
        </button>
      </div>
    </div>
    <textarea
      #field
      class="block w-full min-w-0 resize-y bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
      [class.hidden]="preview()"
      [id]="inputId()"
      [rows]="rows()"
      [attr.maxlength]="maxLength()"
      [attr.aria-describedby]="describedBy()"
      [attr.aria-required]="required() || null"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [value]="value()"
      (input)="value.set(field.value)"
      (keydown)="shortcut($event)"
    ></textarea>
    @if (preview()) {
      @if (value().trim()) {
        <div
          class="app-markdown min-h-24 px-3 py-2 text-sm"
          aria-live="polite"
          [innerHTML]="value() | markdown"
        ></div>
      } @else {
        <p class="min-h-24 px-3 py-2 text-sm text-muted-foreground">
          {{ 'ui.markdown.previewEmpty' | transloco }}
        </p>
      }
    }
  `,
})
export class MarkdownEditor {
  readonly value = model('')
  readonly inputId = input.required<string>()
  readonly placeholder = input('')
  readonly rows = input(6)
  readonly maxLength = input<number | null>(null)
  readonly describedBy = input<string | null>(null)
  readonly required = input(false)
  readonly disabled = input(false)

  protected readonly tools = TOOLS
  protected readonly preview = signal(false)
  private readonly field = viewChild.required<ElementRef<HTMLTextAreaElement>>('field')

  protected shortcut(event: KeyboardEvent): void {
    if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return
    const key = SHORTCUTS[event.key.toLowerCase()]
    if (!key) return
    event.preventDefault()
    this.apply(key)
  }

  protected apply(key: ToolKey): void {
    const tool = TOOLS.find((item) => item.key === key)
    if (!tool || this.disabled()) return
    const textarea = this.field().nativeElement
    const { selectionStart: start, selectionEnd: end } = textarea
    const format = tool.format
    if (format.kind === 'inline') {
      const selected = textarea.value.slice(start, end) || format.placeholder
      textarea.setRangeText(`${format.before}${selected}${format.after}`, start, end)
      const from = start + format.before.length
      textarea.setSelectionRange(from, from + selected.length)
    } else {
      // Extend the selection to whole lines, then prefix each one.
      const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1
      const nextBreak = textarea.value.indexOf('\n', end)
      const lineEnd = nextBreak === -1 ? textarea.value.length : nextBreak
      const lines = textarea.value.slice(lineStart, lineEnd).split('\n')
      const prefixed = lines.map((text, index) => `${format.prefix(index)}${text}`).join('\n')
      textarea.setRangeText(prefixed, lineStart, lineEnd)
      textarea.setSelectionRange(lineStart + prefixed.length, lineStart + prefixed.length)
    }
    textarea.focus()
    this.value.set(textarea.value)
  }
}
