import { lc } from '../../lib/styles/lc'
import { useLandingCopy } from '../../model/useLandingCopy'
import { Abs, SceneFootnote, SceneShell } from './parts'

/** Scene "Partners" — ported from the motion prototype; the landing engine animates it after mount. */
export const ScenePartners = () => {
  const c = useLandingCopy()
  return (
    <SceneShell id="partners" labelKey="partners.our_partners">
      <Abs w={440} x={60} y={170}>
        <div className={lc('eyebrow', 'mb-[18px]')} data-a="up">
          {c('partners.our_partners')}
        </div>
        <h2 className={lc('h h56')}>
          <span className={lc('line')}>
            <span>{c('partners.partners_who_keep')}</span>
          </span>
          <span className={lc('line')}>
            <span>
              {c('partners.the')}{' '}
              <span className={lc('hl')}>{c('partners.signal_on_air')}</span>
            </span>
          </span>
        </h2>
        <p className={lc('lede s', 'mt-[22px]')} data-a="up">
          {c('partners.labels_studios_and_services_we_build_wit')}
        </p>
        <div className={lc('row mono', 'mt-[28px]')} data-a="up">
          <svg aria-hidden="true" className={lc('i', 'w-[15px]! text-accent')}>
            <use href="#i-grip" />
          </svg>
          {c('partners.drag_throw_squeeze')}
        </div>
        <div className={lc('ctas', 'mt-[24px]')} data-a="up">
          <a
            className={lc('btn btn-primary magnetic')}
            data-cursor="hover"
            href="#partners"
          >
            {c('partners.become_a_partner')}{' '}
            <svg aria-hidden="true" className={lc('i')}>
              <use href="#i-arrow" />
            </svg>
          </a>
        </div>
      </Abs>
      <Abs
        aria-hidden="true"
        h={780}
        id="partnerZone"
        markers="drag-zone"
        w={900}
        x={520}
        y={70}
      />
      <SceneFootnote
        noteKey="partners.placeholder_marks_replace_with_real_part"
        w={1320}
        x={60}
        y={854}
      />
    </SceneShell>
  )
}
