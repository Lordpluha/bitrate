'use client'

import { useLandingCopy } from '../../model/useLandingCopy'

/** Scene "Partners" — ported from the motion prototype; the landing engine animates it after mount. */
export const ScenePartners = () => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('partners.our_partners')}
      className="scene"
      data-label="Partners"
      id="partners"
    >
      <div className="board">
        <div
          className="abs"
          style={{ '--x': '60', '--y': '170', '--w': '440' }}
        >
          <div className="eyebrow" data-a="up" style={{ marginBottom: '18px' }}>
            {c('partners.our_partners')}
          </div>
          <h2 className="h h56">
            <span className="line">
              <span>{c('partners.partners_who_keep')}</span>
            </span>
            <span className="line">
              <span>
                {c('partners.the')}{' '}
                <span className="hl">{c('partners.signal_on_air')}</span>
              </span>
            </span>
          </h2>
          <p className="lede s" data-a="up" style={{ marginTop: '22px' }}>
            {c('partners.labels_studios_and_services_we_build_wit')}
          </p>
          <div className="row mono" data-a="up" style={{ marginTop: '28px' }}>
            <svg
              aria-hidden="true"
              className="i"
              style={{ width: '15px', color: 'var(--accent)' }}
            >
              <use href="#i-grip" />
            </svg>
            {c('partners.drag_throw_squeeze')}
          </div>
          <div className="ctas" data-a="up" style={{ marginTop: '24px' }}>
            <a
              className="btn btn-primary magnetic"
              data-cursor="hover"
              href="#partners"
            >
              {c('partners.become_a_partner')}{' '}
              <svg aria-hidden="true" className="i">
                <use href="#i-arrow" />
              </svg>
            </a>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="abs drag-zone"
          id="partnerZone"
          style={{ '--x': '520', '--y': '70', '--w': '900', '--h': '780' }}
        ></div>
        <div
          className="abs row d-only"
          style={{
            '--x': '60',
            '--y': '854',
            '--w': '1320',
            justifyContent: 'space-between',
          }}
        >
          <span className="sig">{c('partners.music_lives_on')}</span>
          <span className="disc">
            {c('partners.placeholder_marks_replace_with_real_part')}
          </span>
        </div>
      </div>
    </section>
  )
}
