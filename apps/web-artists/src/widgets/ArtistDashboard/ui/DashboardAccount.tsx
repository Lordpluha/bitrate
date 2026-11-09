import { Avatar, AvatarFallback, AvatarImage, Button } from '@bitrate/ui-react'
import {
  useManageArtistAccounts,
  useSavedArtistAccounts,
} from '@entities/artist-account'
import type { ArtistIdentity } from '@shared/auth/artistSession.types'
import { useAuthContext } from '@shared/hooks'
import { useI18n } from '@shared/i18n'
import { Check, LoaderCircle, LogOut, Plus, X } from 'lucide-react'

export function DashboardAccount({ artist }: { artist: ArtistIdentity }) {
  const { logout, isLoggingOut, logoutError } = useAuthContext()
  const { t, tMessage } = useI18n()
  const accounts = useSavedArtistAccounts(artist.id)
  const manage = useManageArtistAccounts(artist.id)
  const busy = manage.isPending || isLoggingOut
  const entries = accounts.data?.accounts ?? [{ ...artist, current: true }]
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        {t('account.switcher.description')}
      </p>
      <ul className="artist-account-list">
        {entries.map((account) => (
          <li data-current={account.current} key={account.id}>
            <button
              aria-current={account.current ? 'true' : undefined}
              className="artist-account-choice"
              disabled={busy || account.current}
              onClick={() => manage.mutate({ kind: 'switch', id: account.id })}
              type="button"
            >
              <Avatar className="size-10 shrink-0">
                <AvatarImage alt="" src={account.avatar ?? undefined} />
                <AvatarFallback>
                  {account.username.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {account.username}
                </span>
                <span className="text-xs text-text-secondary">
                  {t(
                    account.current
                      ? 'account.switcher.current'
                      : 'account.switcher.switch',
                  )}
                </span>
              </span>
              {account.current && (
                <Check aria-hidden="true" className="size-4 text-accent" />
              )}
            </button>
            {!account.current && (
              <Button
                aria-label={t('account.switcher.remove', {
                  name: account.username,
                })}
                disabled={busy}
                onClick={() =>
                  manage.mutate({ kind: 'remove', id: account.id })
                }
                size="icon"
                title={t('account.switcher.remove', { name: account.username })}
                variant="ghost"
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            )}
          </li>
        ))}
      </ul>
      {accounts.isPending && (
        <p
          className="flex items-center gap-2 text-xs text-text-secondary"
          role="status"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />
          {t('account.switcher.loading')}
        </p>
      )}
      {accounts.error && (
        <div className="space-y-2">
          <p className="text-sm text-destructive" role="alert">
            {tMessage(accounts.error.message)}
          </p>
          <Button
            disabled={busy}
            onClick={() => void accounts.refetch()}
            size="sm"
            variant="outline"
          >
            {t('common.tryAgain')}
          </Button>
        </div>
      )}
      <Button
        className="w-full gap-2"
        disabled={
          busy ||
          accounts.isPending ||
          accounts.isError ||
          (accounts.data &&
            accounts.data.accounts.length >= accounts.data.limit)
        }
        onClick={() => manage.mutate({ kind: 'add' })}
        variant="outline"
      >
        <Plus aria-hidden="true" className="size-4" />
        {t('account.switcher.add')}
      </Button>
      <p className="text-xs text-text-secondary">
        {t('account.switcher.hint', { limit: accounts.data?.limit ?? 5 })}
      </p>
      <div className="border-t border-border pt-4">
        <Button
          className="w-full justify-start gap-2"
          disabled={busy}
          onClick={logout}
          variant="ghost"
        >
          <LogOut aria-hidden="true" className="size-4" />
          {t('shell.signOut')}
        </Button>
      </div>
      {(manage.error || logoutError) && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(manage.error?.message ?? logoutError ?? undefined)}
        </p>
      )}
    </div>
  )
}
