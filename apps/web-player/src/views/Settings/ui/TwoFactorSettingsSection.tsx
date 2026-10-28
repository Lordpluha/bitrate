import { useI18n } from '@/shared/i18n'
import { useTwoFactorSettings } from '@/views/Settings/model/useTwoFactorSettings'
import { SettingsSection } from '@/views/Settings/ui/controls/SettingsSection'

const sanitizeCode = (value: string) => value.replace(/\D/g, '')

export const TwoFactorSettingsSection = () => {
  const { t } = useI18n()
  const twoFactor = useTwoFactorSettings()

  return (
    <SettingsSection title={t('settings.twoFactor')}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {twoFactor.isEnabled
            ? t('settings.twoFactor.enabled')
            : t('settings.twoFactor.setupDescription')}
        </p>
        {!twoFactor.isEnabled && !twoFactor.setup && (
          <button
            className="inline-flex h-9 w-fit items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
            disabled={twoFactor.isPending}
            onClick={twoFactor.startSetup}
            type="button"
          >
            {t('settings.twoFactor.setup')}
          </button>
        )}
      </div>

      {twoFactor.setup && !twoFactor.isEnabled && (
        <form className="grid max-w-160 gap-3" onSubmit={twoFactor.enable}>
          {twoFactor.setup.manualCode && (
            <div className="rounded bg-surface p-3 text-sm text-foreground">
              {t('settings.twoFactor.manualCode', {
                code: twoFactor.setup.manualCode,
              })}
            </div>
          )}
          <label
            className="grid gap-2 text-sm text-foreground"
            htmlFor="enable-two-factor-code"
          >
            {t('settings.twoFactor.code')}
          </label>
          <input
            autoComplete="one-time-code"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            id="enable-two-factor-code"
            inputMode="numeric"
            maxLength={6}
            name="enable-two-factor-code"
            onChange={(event) =>
              twoFactor.setEnableCode(sanitizeCode(event.target.value))
            }
            pattern="[0-9]{6}"
            required
            value={twoFactor.enableCode}
          />
          <button
            className="inline-flex h-9 w-fit items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
            disabled={twoFactor.isPending}
            type="submit"
          >
            {t('settings.twoFactor.enable')}
          </button>
        </form>
      )}

      {twoFactor.isEnabled && (
        <form className="grid max-w-160 gap-3" onSubmit={twoFactor.disable}>
          <label
            className="text-sm text-foreground"
            htmlFor="disable-two-factor-code"
          >
            {t('settings.twoFactor.currentCode')}
          </label>
          <input
            autoComplete="one-time-code"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            id="disable-two-factor-code"
            inputMode="numeric"
            maxLength={6}
            name="disable-two-factor-code"
            onChange={(event) =>
              twoFactor.setDisableCode(sanitizeCode(event.target.value))
            }
            pattern="[0-9]{6}"
            required
            value={twoFactor.disableCode}
          />
          <button
            className="inline-flex h-9 w-fit items-center rounded-md bg-destructive px-6 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-60"
            disabled={twoFactor.isPending}
            type="submit"
          >
            {t('settings.twoFactor.disable')}
          </button>
        </form>
      )}
    </SettingsSection>
  )
}
