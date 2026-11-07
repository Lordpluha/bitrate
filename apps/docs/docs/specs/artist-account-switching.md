# Artist account switching

The workspace sidebar contains theme and interface language controls, including its collapsed and mobile variants. The account dialog contains only authenticated accounts, add-account, remove-saved-account and sign-out actions. Shared workspace dialogs use the workspace surface tokens, a fixed header and a scrollable body.

An artist adds another account by choosing **Add another account** and completing the regular password/social login, including two-factor authentication when enabled. The current session is remembered before leaving the workspace. Up to five accounts can be saved in one browser. Switching performs a full document navigation to discard the previous account's cache, forms and audio. Other open workspace tabs synchronize the account selection.

## Session storage

`ArtistAccountLink` associates a hashed browser credential with an existing `ArtistSession`. Its composite foreign key binds the session to the same artist and cascades when the session is revoked. The opaque credential is sent only in a host-only, HttpOnly, SameSite Strict cookie. Secure deployments use `__Host-artist_accounts`; local HTTP uses `artist_accounts`. Neither authentication tokens nor the browser credential are exposed to JavaScript or stored in localStorage.

All `/api/v1/artists/auth/accounts` endpoints require an active artist session:

- `GET /`: return the current identity and unexpired saved identities, without session secrets.
- `POST /current`: remember the authenticated session before adding another account.
- `POST /:artistId/switch`: require the target's saved, unexpired session in this browser group, remember the current session, rotate the target tokens, then replace the active auth cookies.
- `DELETE /:artistId`: revoke only the inactive account's linked session. This does not delete the artist or sign out other devices. The current account uses regular sign-out.

Group mutations use a PostgreSQL transaction advisory lock. Expired sessions and deleted artists cannot be selected. Session revocation, password reset and account deletion remove saved access through the session relation. Once the active account signs out, accessing the switcher requires a regular sign-in again.

Browser API calls include `X-Artist-Account` with the rendered workspace identity. An authenticated request with a different artist returns `409` with code `errors.artist_auth.account_changed` before the controller runs; the client reloads the workspace. This prevents stale tabs from writing as another selected account. Cross-tab notifications contain only a change kind and a nonce, never credentials.

Apply `20261106140000_artist_account_switching` before starting the updated API.
