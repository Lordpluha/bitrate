import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import { lc } from '../../lib/styles/lc'
import { GITHUB_REPO_URL } from '../../model/links'
import type { LandingKey } from '../../model/messages/en'
import { useLandingCopy } from '../../model/useLandingCopy'
import { Abs, SceneShell, TryInPlayer } from './parts'

/**
 * The questions a visitor has before signing up, each with an answer that is true today. No
 * claim here may promise more than the product does (see PRODUCT.md: positioning is open).
 */
const QUESTIONS: readonly (readonly [LandingKey, LandingKey])[] = [
  ['faq.q_free', 'faq.a_free'],
  ['faq.q_music', 'faq.a_music'],
  ['faq.q_devices', 'faq.a_devices'],
  ['faq.q_quality', 'faq.a_quality'],
  ['faq.q_signin', 'faq.a_signin'],
  ['faq.q_data', 'faq.a_data'],
]

/** Scene "FAQ": the objections answered, right before the last call to action. */
export const SceneFaq = () => {
  const c = useLandingCopy()
  return (
    <SceneShell id="faq" labelKey="faq.before_you_press_play">
      <Abs w={440} x={60} y={170}>
        <div className={lc('eyebrow', 'mb-[18px]')} data-a="up">
          {c('faq.eyebrow')}
        </div>
        <h2 className={lc('h h56')}>
          <span className={lc('line')}>
            <span>{c('faq.before_you')}</span>
          </span>
          <span className={lc('line')}>
            <span className={lc('hl')}>{c('faq.press_play')}</span>
          </span>
        </h2>
        <p className={lc('lede s', 'mt-[22px]')} data-a="up">
          {c('faq.lede')}
        </p>
        <div className="mt-[14px]" data-a="up">
          <TryInPlayer />
        </div>
      </Abs>
      <Abs
        data-a="win"
        h={660}
        markers="win scene-block"
        w={800}
        x={580}
        y={120}
      >
        <section aria-label={c('faq.eyebrow')} className={lc('faq-list')}>
          {QUESTIONS.map(([q, a], i) => (
            <details className={lc('faq-item')} key={q} open={i === 0}>
              <summary>
                {c(q)}
                <svg aria-hidden="true" className={lc('i faq-chev')}>
                  <use href="#i-arrow" />
                </svg>
              </summary>
              <p>
                {c(a)}
                {a === 'faq.a_data' ? (
                  <>
                    {' '}
                    <Link
                      className={lc('ulink faq-link')}
                      href={ROUTES.privacy}
                    >
                      {c('faq.privacy_policy')}
                    </Link>
                  </>
                ) : null}
                {a === 'faq.a_free' ? (
                  <>
                    {' '}
                    <a
                      className={lc('ulink faq-link')}
                      href={GITHUB_REPO_URL}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {c('faq.source_on_github')}
                    </a>
                  </>
                ) : null}
              </p>
            </details>
          ))}
        </section>
      </Abs>
    </SceneShell>
  )
}
