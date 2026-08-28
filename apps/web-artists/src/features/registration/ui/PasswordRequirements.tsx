'use client'

import { CircleCheck, CircleIcon, Typography } from '@spotify/ui-react'
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
export const PasswordRequirements = ({ rules }: PasswordRequirementsProps) => (
  <div className="mt-3">
    <Typography as="p" className="font-bold" size={'body'}>
      Password must contain at least:
    </Typography>
    <ul className="mt-2 flex flex-col gap-2">
      <PasswordRule label="1 letter" met={rules.hasLetter} />
      <PasswordRule
        label="1 number or special symbol (for example, # ? ! &)"
        met={rules.hasNumberOrSpecial}
      />
      <PasswordRule label="10 characters" met={rules.hasMinLength} />
    </ul>
  </div>
)
