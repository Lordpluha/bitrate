'use client'

import { CircleCheck, CircleIcon, Typography } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import type { PasswordRules } from '../model/useRegistrationForm'

/** Marker size used by both the met and unmet states. */
const MARKER_SIZE = 14

/** Colour of a satisfied requirement's tick. */
const MET_COLOR = '#4ADE80'

/** Colour of an unmet requirement's empty circle. */
const UNMET_COLOR = '#000000'

/** One requirement line, with its met/unmet marker. */
type PasswordRuleProps = {
  met: boolean
  label: string
}

const PasswordRule = ({ met, label }: PasswordRuleProps) => (
  <li className={met ? 'text-white' : 'text-grey-500'}>
    <span className="inline-flex items-center gap-2">
      {met ? (
        <CircleCheck
          height={MARKER_SIZE}
          primaryColor={MET_COLOR}
          width={MARKER_SIZE}
        />
      ) : (
        <CircleIcon
          height={MARKER_SIZE}
          primaryColor={UNMET_COLOR}
          width={MARKER_SIZE}
        />
      )}
      {label}
    </span>
  </li>
)

export type PasswordRequirementsProps = {
  rules: PasswordRules
}

/** Live checklist of what the chosen password still needs. */
export const PasswordRequirements = ({ rules }: PasswordRequirementsProps) => {
  const { t } = useI18n()
  return (
    <div className="mt-3">
      <Typography as="p" className="font-bold" size={'body'}>
        {t('auth.registration.rulesTitle')}
      </Typography>
      <ul className="mt-2 flex flex-col gap-2">
        <PasswordRule
          label={t('auth.registration.ruleLetter')}
          met={rules.hasLetter}
        />
        <PasswordRule
          label={t('auth.registration.ruleNumberOrSymbol')}
          met={rules.hasNumberOrSpecial}
        />
        <PasswordRule
          label={t('auth.registration.ruleLength')}
          met={rules.hasMinLength}
        />
      </ul>
    </div>
  )
}
