import { useTwoFactorSettings } from '@/views/Settings/model/useTwoFactorSettings'
import { SettingsSection } from '@/views/Settings/ui/controls/SettingsSection'

const sanitizeCode = (value: string) => value.replace(/\D/g, '')

export const TwoFactorSettingsSection = () => {
  const twoFactor = useTwoFactorSettings()

  return (
    <SettingsSection title="Two-factor authentication">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-text-subdued">
          {twoFactor.isEnabled
            ? '2FA is enabled for this account.'
            : 'Protect your account with an authenticator app.'}
        </p>
        {!twoFactor.isEnabled && !twoFactor.setup && (
          <button
            className="rounded-full bg-white/10 px-5 py-2 text-sm font-bold text-text hover:bg-white/15 disabled:opacity-60"
            disabled={twoFactor.isPending}
            onClick={twoFactor.startSetup}
            type="button"
          >
            Set up 2FA
          </button>
        )}
      </div>

      {twoFactor.setup && !twoFactor.isEnabled && (
        <form className="grid max-w-160 gap-3" onSubmit={twoFactor.enable}>
          {twoFactor.setup.manualCode && (
            <div className="rounded bg-surface p-3 text-sm text-text">
              Manual code: <strong>{twoFactor.setup.manualCode}</strong>
            </div>
          )}
          <label
            className="grid gap-2 text-sm text-text"
            htmlFor="enable-two-factor-code"
          >
            Authentication code
          </label>
          <input
            autoComplete="one-time-code"
            className="h-10 rounded bg-surface px-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/25"
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
            className="w-fit rounded-full bg-green-500 px-5 py-2 text-sm font-bold text-black hover:bg-green-400 disabled:opacity-60"
            disabled={twoFactor.isPending}
            type="submit"
          >
            Enable 2FA
          </button>
        </form>
      )}

      {twoFactor.isEnabled && (
        <form className="grid max-w-160 gap-3" onSubmit={twoFactor.disable}>
          <label
            className="text-sm text-text"
            htmlFor="disable-two-factor-code"
          >
            Current authentication code
          </label>
          <input
            autoComplete="one-time-code"
            className="h-10 rounded bg-surface px-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/25"
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
            className="rounded-full bg-red-500/15 px-5 py-2 text-sm font-bold text-red-200 hover:bg-red-500/25 disabled:opacity-60"
            disabled={twoFactor.isPending}
            type="submit"
          >
            Disable 2FA
          </button>
        </form>
      )}
    </SettingsSection>
  )
}
