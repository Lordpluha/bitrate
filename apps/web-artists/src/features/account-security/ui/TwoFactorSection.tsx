import { Button, Input } from '@bitrate/ui-react'
import { useTwoFactorSetup, useTwoFactorToggle } from '@entities/artist-account'
import { type TranslationKey, useI18n } from '@shared/i18n'
import { ShieldCheck, ShieldOff } from 'lucide-react'
import { useId, useState } from 'react'

const CODE_PATTERN = /^\d{6}$/

interface TwoFactorSectionProps {
  artistId: string
  enabled: boolean
}

/** Enrol with an authenticator app (QR or manual key + code), or turn it off with a code. */
export function TwoFactorSection({ artistId, enabled }: TwoFactorSectionProps) {
  const { t, tMessage } = useI18n()
  const id = useId()
  const setup = useTwoFactorSetup()
  const toggle = useTwoFactorToggle(artistId, !enabled)
  const [code, setCode] = useState('')
  const [problem, setProblem] = useState<TranslationKey | null>(null)
  const [disabling, setDisabling] = useState(false)
  const enrolling = !enabled && setup.data !== undefined
  const askingCode = enrolling || (enabled && disabling)

  const confirm = async () => {
    if (!CODE_PATTERN.test(code.trim())) {
      setProblem('settings.twoFactor.codeFormat')
      return
    }
    try {
      await toggle.mutateAsync(code.trim())
      setCode('')
      setDisabling(false)
      setup.reset()
    } catch {
      // The code stays so the artist can correct it.
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {enabled ? (
            <ShieldCheck aria-hidden="true" className="size-5 text-accent" />
          ) : (
            <ShieldOff
              aria-hidden="true"
              className="size-5 text-text-secondary"
            />
          )}
          <div>
            <p className="text-sm font-medium">
              {t('settings.twoFactor.title')}
            </p>
            <p className="text-sm text-text-secondary">
              {enabled
                ? t('settings.twoFactor.on')
                : t('settings.twoFactor.off')}
            </p>
          </div>
        </div>
        {!askingCode &&
          (enabled ? (
            <Button
              onClick={() => setDisabling(true)}
              size="sm"
              variant="outline"
            >
              {t('settings.twoFactor.turnOff')}
            </Button>
          ) : (
            <Button
              disabled={setup.isPending}
              onClick={() => setup.mutate()}
              size="sm"
              variant="outline"
            >
              {setup.isPending
                ? t('settings.twoFactor.preparing')
                : t('settings.twoFactor.setUp')}
            </Button>
          ))}
      </div>
      {setup.error && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(setup.error.message)}
        </p>
      )}
      {enrolling && setup.data && (
        <div className="flex flex-wrap items-start gap-4 rounded-lg border border-border p-4">
          <img
            alt={t('settings.twoFactor.qrAlt')}
            className="size-40 rounded-md bg-white p-2"
            src={setup.data.qrCodeDataUrl}
          />
          <div className="min-w-0 flex-1 space-y-2 text-sm">
            <p>{t('settings.twoFactor.scan')}</p>
            <code className="block break-all rounded-md bg-secondary px-3 py-2 text-xs">
              {setup.data.manualCode}
            </code>
            <p className="text-text-secondary">
              {t('settings.twoFactor.then')}
            </p>
          </div>
        </div>
      )}
      {askingCode && (
        <form
          aria-busy={toggle.isPending}
          className="flex flex-wrap items-end gap-3"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void confirm()
          }}
        >
          <div className="space-y-1">
            <label className="block text-sm font-medium" htmlFor={`${id}-code`}>
              {t('settings.twoFactor.code')}
            </label>
            <Input
              autoComplete="one-time-code"
              className="w-40 text-center tracking-[0.3em]"
              data-initial-focus
              disabled={toggle.isPending}
              id={`${id}-code`}
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => {
                setProblem(null)
                toggle.reset()
                setCode(event.target.value.replace(/\D/g, ''))
              }}
              value={code}
            />
          </div>
          <Button
            className="artist-workspace-primary"
            disabled={toggle.isPending}
            type="submit"
            variant="primary"
          >
            {toggle.isPending
              ? t('settings.twoFactor.checking')
              : enabled
                ? t('settings.twoFactor.confirmOff')
                : t('settings.twoFactor.confirmOn')}
          </Button>
          <Button
            disabled={toggle.isPending}
            onClick={() => {
              setCode('')
              setProblem(null)
              setDisabling(false)
              setup.reset()
              toggle.reset()
            }}
            type="button"
            variant="ghost"
          >
            {t('common.cancel')}
          </Button>
        </form>
      )}
      {(problem ?? toggle.error) && (
        <p className="text-sm text-destructive" role="alert">
          {problem ? t(problem) : tMessage(toggle.error?.message)}
        </p>
      )}
    </div>
  )
}
