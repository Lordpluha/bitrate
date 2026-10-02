import { Typography } from '@bitrate/ui-react'
import {
  LEGAL_DOCUMENTS,
  type LegalBlock,
  type LegalDocument,
} from '@shared/legal'
import { ROUTES } from '@shared/routes/routes'
import { LegalInline } from './LegalInline'

type LegalViewProps = {
  document: LegalDocument
}

const LegalBlockView = ({ block }: { block: LegalBlock }) => {
  switch (block.kind) {
    case 'paragraph':
      return (
        <p className="leading-relaxed">
          <LegalInline text={block.text} />
        </p>
      )
    case 'note':
      return (
        <p className="rounded-md border border-neutral-600 bg-black-800 px-4 py-3 text-sm leading-relaxed">
          <LegalInline text={block.text} />
        </p>
      )
    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul'
      return (
        <ListTag
          className={`${block.ordered ? 'list-decimal' : 'list-disc'} flex flex-col gap-1 pl-6 leading-relaxed`}
        >
          {block.items.map((item) => (
            <li key={item}>
              <LegalInline text={item} />
            </li>
          ))}
        </ListTag>
      )
    }
    case 'table':
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                {block.header.map((cell) => (
                  <th
                    className="border-b border-neutral-600 px-3 py-2 font-semibold"
                    key={cell}
                    scope="col"
                  >
                    <LegalInline text={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join('|')}>
                  {row.map((cell) => (
                    <td
                      className="border-b border-neutral-700 px-3 py-2 align-top"
                      key={cell}
                    >
                      <LegalInline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

/**
 * One legal document as a readable page. The banner stays until the texts have been reviewed
 * by a lawyer and the operator placeholders are filled in.
 */
export const LegalView = ({ document }: LegalViewProps) => (
  <div className="min-h-screen bg-black-800 text-white">
    <article className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
      <p
        className="rounded-md border border-primary px-4 py-3 text-sm"
        role="note"
      >
        Draft — pending legal review. Text in [[double brackets]] is not filled
        in yet.
      </p>

      <Typography as="h1" size="heading2">
        {document.title}
      </Typography>

      {document.sections.map((section) => (
        <section
          className="flex flex-col gap-3"
          key={section.heading ?? 'lead-in'}
        >
          {section.heading ? (
            <Typography as="h2" size="heading5">
              {section.heading}
            </Typography>
          ) : null}
          {section.blocks.map((block) => (
            <LegalBlockView
              block={block}
              key={
                block.kind === 'table'
                  ? block.header.join('|')
                  : `${block.kind}:${JSON.stringify(block)}`
              }
            />
          ))}
        </section>
      ))}

      <nav
        aria-label="Other legal documents"
        className="flex flex-wrap gap-x-4 gap-y-2 border-t border-neutral-600 pt-6 text-sm"
      >
        {LEGAL_DOCUMENTS.filter((other) => other.slug !== document.slug).map(
          (other) => (
            <a
              className="text-primary hover:opacity-70"
              href={ROUTES.legal(other.slug)}
              key={other.slug}
            >
              {other.title}
            </a>
          ),
        )}
      </nav>
    </article>
  </div>
)
