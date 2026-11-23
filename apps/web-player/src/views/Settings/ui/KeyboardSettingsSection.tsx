'use client'

import { selectSingleKeyShortcuts, useSettingsStore } from '@entities/Settings'
import { SettingsRow, SettingsSwitch } from '@shared/ui'
import { type TranslationKey, useI18n } from '@/shared/i18n'
import { SettingsSection } from '@/views/Settings/ui/controls/SettingsSection'

type ShortcutEntry = {
  action: TranslationKey
  keys: string[]
  isSingleKey: boolean
}

/** Mirrors `usePlayerHotkeys`; keep both in step. */
const SHORTCUTS: ShortcutEntry[] = [
  {
    action: 'settings.keyboard.action.playPause',
    isSingleKey: false,
    keys: ['Space'],
  },
  {
    action: 'settings.keyboard.action.seek',
    isSingleKey: false,
    keys: ['←', '→'],
  },
  {
    action: 'settings.keyboard.action.skip',
    isSingleKey: false,
    keys: ['Ctrl/⌘ ←', 'Ctrl/⌘ →'],
  },
  {
    action: 'settings.keyboard.action.volume',
    isSingleKey: false,
    keys: ['↓', '↑'],
  },
  {
    action: 'settings.keyboard.action.volume',
    isSingleKey: true,
    keys: ['−', '+'],
  },
  { action: 'settings.keyboard.action.mute', isSingleKey: true, keys: ['M'] },
  {
    action: 'settings.keyboard.action.shuffle',
    isSingleKey: true,
    keys: ['S'],
  },
  { action: 'settings.keyboard.action.repeat', isSingleKey: true, keys: ['R'] },
  { action: 'settings.keyboard.action.like', isSingleKey: true, keys: ['L'] },
  { action: 'settings.keyboard.action.queue', isSingleKey: true, keys: ['Q'] },
]

/** Keyboard preferences: the single-key shortcut switch (WCAG 2.1.4) and the shortcut list. */
export const KeyboardSettingsSection = () => {
  const { t } = useI18n()
  const isSingleKeyEnabled = useSettingsStore(selectSingleKeyShortcuts)
  const toggleSetting = useSettingsStore((state) => state.toggleSetting)
  const visibleShortcuts = SHORTCUTS.filter(
    (shortcut) => isSingleKeyEnabled || !shortcut.isSingleKey,
  )

  return (
    <SettingsSection
      searchTerms={[
        t('settings.keyboard.singleKey'),
        t('settings.keyboard.list'),
      ]}
      title={t('settings.keyboard')}
    >
      <SettingsRow
        description={t('settings.keyboard.singleKey.description')}
        label={t('settings.keyboard.singleKey')}
      >
        <SettingsSwitch
          ariaLabel={t('settings.keyboard.singleKey')}
          checked={isSingleKeyEnabled}
          onChange={() => toggleSetting('singleKeyShortcuts')}
        />
      </SettingsRow>

      <table className="mt-3 w-full text-left text-sm">
        <caption className="pb-2 text-left text-sm font-semibold text-foreground">
          {t('settings.keyboard.list')}
        </caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">{t('settings.keyboard.column.action')}</th>
            <th scope="col">{t('settings.keyboard.column.keys')}</th>
          </tr>
        </thead>
        <tbody>
          {visibleShortcuts.map((shortcut) => (
            <tr
              className="border-b border-border last:border-b-0"
              key={shortcut.keys.join(' ')}
            >
              <th
                className="py-2 pr-4 font-normal text-muted-foreground"
                scope="row"
              >
                {t(shortcut.action)}
              </th>
              <td className="py-2 text-right">
                <span className="inline-flex flex-wrap justify-end gap-1.5">
                  {shortcut.keys.map((key) => (
                    <kbd
                      className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground"
                      key={key}
                    >
                      {key}
                    </kbd>
                  ))}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SettingsSection>
  )
}
