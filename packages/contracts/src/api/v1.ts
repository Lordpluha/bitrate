export interface paths {
  '/api/v1': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get welcome operation. */
    get: operations['AppController_getWelcome_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/health': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the get health operation.
     * @description Alias for `/health/ready`. Prefer `/health/live` or `/health/ready` directly.
     */
    get: operations['AppController_getHealth_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/health/live': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Returns a dependency-free liveness signal.
     * @description Answers immediately with no dependency checks. An orchestrator restarts the container when this stops responding; it never fails because a downstream dependency is down — that is `/health/ready`.
     */
    get: operations['AppController_getLiveness_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/health/ready': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Returns a bounded, topology-free dependency readiness signal.
     * @description Checks Postgres, Redis and storage in parallel, each bounded by `HEALTH_CHECK_TIMEOUT_MS`. An orchestrator stops routing traffic to this instance while it fails — unlike `/health/live`, this is expected to fail when a dependency is degraded.
     */
    get: operations['AppController_getReadiness_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/storage/images/presigned-url': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Returns a short-lived direct URL for a private cover or profile image.
     * @description `key` must match a cover (`tracks|albums|playlists/<id>/cover.<ext>`) or profile image (`artists|users/<id>/(avatar|background).<ext>`) storage key. The URL expires after 900 seconds.
     */
    get: operations['StorageController_getImageUrl_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/storage/objects/{token}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Streams an object, through STORAGE_SERVICE, addressed by a signed token, honoring an HTTP Range.
     * @description Time-limited URL issued by the storage service; the API streams the object through STORAGE_SERVICE. The token embeds the object key and expiry, verified via HMAC.
     */
    get: operations['StorageController_streamSignedObject_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/login': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the login operation. */
    post: operations['UsersAuthController_login_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/registration': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the registration operation. */
    post: operations['UsersAuthController_registration_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/logout': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the logout operation. */
    post: operations['UsersAuthController_logout_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/refresh': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the refresh operation. */
    post: operations['UsersAuthController_refresh_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/me': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get me operation. */
    get: operations['UsersAuthController_getMe_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/legal/accept': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Records that the signed-in user accepted the current legal documents.
     * @description Records the current Terms of Use, Community Guidelines and Privacy Policy revision for the signed-in account. Used when `legalAcceptanceRequired` is true on the account.
     */
    post: operations['UsersAuthController_acceptLegal_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/forgot-password': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the forgot password operation. */
    post: operations['UsersAuthController_forgotPassword_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/reset-password': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the reset password operation. */
    post: operations['UsersAuthController_resetPassword_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/verify-email': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Confirms a newly registered user's email address. */
    post: operations['UsersAuthController_verifyEmail_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/verify-email/resend': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Reissues a verification email without exposing account existence.
     * @description Never reveals whether the email belongs to an account, and is a no-op when the account is already verified.
     */
    post: operations['UsersAuthController_resendEmailVerification_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/sessions': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Lists the current user's active sessions.
     * @description Each session carries a `current` flag marking the session making this request.
     */
    get: operations['UsersAuthController_getSessions_v1']
    put?: never
    post?: never
    /** Revokes every session except the current browser session. */
    delete: operations['UsersAuthController_revokeOtherSessions_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/sessions/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post?: never
    /** Revokes an individual session owned by the current user. */
    delete: operations['UsersAuthController_revokeSession_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/2fa/setup': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the two factor setup operation. */
    post: operations['UsersAuthController_twoFactorSetup_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/2fa/enable': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the two factor enable operation. */
    post: operations['UsersAuthController_twoFactorEnable_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/2fa/disable': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post?: never
    /** Runs the two factor disable operation. */
    delete: operations['UsersAuthController_twoFactorDisable_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/2fa/verify-login': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Runs the two factor verify login operation.
     * @description Exchange the pending 2FA session token and a TOTP code for full session cookies.
     */
    post: operations['UsersAuthController_twoFactorVerifyLogin_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/oauth/google': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the google auth operation.
     * @description Sets an oauth_state cookie and redirects to the Google consent screen. Not usable from Swagger UI.
     */
    get: operations['UsersOAuthController_googleAuth_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/oauth/google/callback': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the google callback operation.
     * @description Handled by Google after user consents. On success sets auth cookies and redirects to USER_WEB_HOST (or legacy WEB_HOST). On 2FA required, redirects to /login/2fa with a pending token.
     */
    get: operations['UsersOAuthController_googleCallback_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/oauth/facebook': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the facebook auth operation.
     * @description Sets an oauth_state cookie and redirects to the Facebook consent screen. Not usable from Swagger UI.
     */
    get: operations['UsersOAuthController_facebookAuth_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/oauth/facebook/callback': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the facebook callback operation.
     * @description Handled by Facebook after user consents. On success sets auth cookies and redirects to USER_WEB_HOST (or legacy WEB_HOST). On 2FA required, redirects to /login/2fa with a pending token.
     */
    get: operations['UsersOAuthController_facebookCallback_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/users': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get all operation. */
    get: operations['UsersController_getAll_v1']
    /** Runs the put by id operation. */
    put: operations['UsersController_putById_v1']
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/users/username/{username}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get by username operation. */
    get: operations['UsersController_getByUsername_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/users/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get by id operation. */
    get: operations['UsersController_getById_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/users/avatar': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the upload avatar operation. */
    post: operations['UsersController_uploadAvatar_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/users/{id}/follow': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Follow a user */
    post: operations['UsersController_follow_v1']
    /** Unfollow a user */
    delete: operations['UsersController_unfollow_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/users/me/following': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** List the users the caller follows */
    get: operations['UsersController_following_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get all operation. */
    get: operations['ArtistsController_getAll_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get by id operation. */
    get: operations['ArtistsController_getById_v1']
    /** Runs the update profile operation. */
    put: operations['ArtistsController_updateProfile_v1']
    post?: never
    /** Runs the delete profile operation. */
    delete: operations['ArtistsController_deleteProfile_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/username/{username}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get by username operation. */
    get: operations['ArtistsController_getByUsername_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/me/following': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get following operation. */
    get: operations['ArtistsController_getFollowing_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/{id}/follow': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the follow operation. */
    post: operations['ArtistsController_follow_v1']
    /** Runs the unfollow operation. */
    delete: operations['ArtistsController_unfollow_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/tracks': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get all operation. */
    get: operations['TracksController_getAll_v1']
    put?: never
    /** Runs the post track operation. */
    post: operations['TracksController_postTrack_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/tracks/stream/{id}/hls/master.m3u8': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the get hls master playlist operation.
     * @description Returns `application/vnd.apple.mpegurl`, listing every available bitrate variant.
     */
    get: operations['TracksController_getHlsMasterPlaylist_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/tracks/stream/{id}/hls/{bitrate}/{asset}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the get hls asset operation.
     * @description Segments are served with an immutable cache header; the variant `.m3u8` playlist is not.
     */
    get: operations['TracksController_getHlsAsset_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/tracks/stream/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the stream track operation.
     * @description Returns the track audio as a binary stream. Supports HTTP range requests for partial content.
     */
    get: operations['TracksController_streamTrack_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/tracks/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get by id operation. */
    get: operations['TracksController_getById_v1']
    /** Runs the put track operation. */
    put: operations['TracksController_putTrack_v1']
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/tracks/liked': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get liked tracks operation. */
    get: operations['TracksController_getLikedTracks_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/tracks/{id}/manifest': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the get manifest operation.
     * @description Returns the fragment index every CMAF rendition is addressed by. Immutable for a given track, so it can be cached indefinitely. See ADR-0020.
     */
    get: operations['TracksController_getManifest_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/tracks/{id}/cmaf/{bitrate}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the stream rendition operation.
     * @description Serves the rendition file, honoring an inclusive `bytes=` Range. The player asks for one fragment at a time using offsets from the manifest.
     */
    get: operations['TracksController_streamRendition_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/tracks/{id}/like': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the like track operation. */
    post: operations['TracksController_likeTrack_v1']
    /** Runs the unlike track operation. */
    delete: operations['TracksController_unlikeTrack_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/playlists': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get all operation. */
    get: operations['PlaylistsController_getAll_v1']
    put?: never
    /** Runs the post operation. */
    post: operations['PlaylistsController_post_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/playlists/me': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get mine operation. */
    get: operations['PlaylistsController_getMine_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/playlists/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get by id operation. */
    get: operations['PlaylistsController_getById_v1']
    /** Runs the update operation. */
    put: operations['PlaylistsController_update_v1']
    post?: never
    /** Runs the delete playlist operation. */
    delete: operations['PlaylistsController_deletePlaylist_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/playlists/{id}/tracks': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the add tracks operation. */
    post: operations['PlaylistsController_addTracks_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/playlists/{id}/tracks/{trackId}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post?: never
    /** Runs the remove track operation. */
    delete: operations['PlaylistsController_removeTrack_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/playlists/{id}/like': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the like playlist operation. */
    post: operations['PlaylistsController_likePlaylist_v1']
    /** Runs the unlike playlist operation. */
    delete: operations['PlaylistsController_unlikePlaylist_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/albums': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get all albums operation. */
    get: operations['AlbumsController_getAllAlbums_v1']
    put?: never
    /** Runs the create album operation. */
    post: operations['AlbumsController_createAlbum_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/albums/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get by id operation. */
    get: operations['AlbumsController_getById_v1']
    /** Runs the update album operation. */
    put: operations['AlbumsController_updateAlbum_v1']
    post?: never
    /**
     * Runs the delete album operation.
     * @description Deletes an album by its ID. Requires authentication.
     */
    delete: operations['AlbumsController_deleteAlbum_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/albums/{id}/like': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the like album operation. */
    post: operations['AlbumsController_likeAlbum_v1']
    /** Runs the unlike album operation. */
    delete: operations['AlbumsController_unlikeAlbum_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/login': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the login operation. */
    post: operations['AuthController_login_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/registration': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the registration operation. */
    post: operations['AuthController_registration_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/email-availability': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Checks whether an artist email is already registered. */
    get: operations['AuthController_emailAvailability_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/logout': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the logout operation. */
    post: operations['AuthController_logout_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/refresh': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the refresh operation. */
    post: operations['AuthController_refresh_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/me': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get me operation. */
    get: operations['AuthController_getMe_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/forgot-password': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the forgot password operation. */
    post: operations['AuthController_forgotPassword_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/reset-password': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the reset password operation. */
    post: operations['AuthController_resetPassword_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/verify-email': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Verify the artist's email address */
    post: operations['AuthController_verifyEmail_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/verify-email/resend': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Resend the artist email verification message
     * @description Never reveals whether the email belongs to an account, and is a no-op when the account is already verified.
     */
    post: operations['AuthController_resendEmail_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/verify-email/code': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Verify the artist email with a six-digit code */
    post: operations['AuthController_verifyEmailCode_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/2fa/setup': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the two factor setup operation. */
    post: operations['AuthController_twoFactorSetup_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/2fa/enable': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the two factor enable operation. */
    post: operations['AuthController_twoFactorEnable_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/2fa/disable': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post?: never
    /** Runs the two factor disable operation. */
    delete: operations['AuthController_twoFactorDisable_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/2fa/verify-login': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Runs the two factor verify login operation.
     * @description Exchange the pending 2FA session token and a TOTP code for full session cookies.
     */
    post: operations['AuthController_twoFactorVerifyLogin_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/oauth/google': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the google auth operation.
     * @description Sets an oauth_state cookie and redirects to the Google consent screen. Not usable from Swagger UI.
     */
    get: operations['ArtistsOAuthController_googleAuth_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/oauth/google/callback': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the google callback operation.
     * @description Handled by Google after artist consents. On success sets auth cookies and redirects to ARTIST_WEB_HOST (or legacy WEB_HOST). On 2FA required, redirects to /login/2fa with a pending token.
     */
    get: operations['ArtistsOAuthController_googleCallback_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/oauth/facebook': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the facebook auth operation.
     * @description Sets an oauth_state cookie and redirects to the Facebook consent screen. Not usable from Swagger UI.
     */
    get: operations['ArtistsOAuthController_facebookAuth_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/oauth/facebook/callback': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the facebook callback operation.
     * @description Handled by Facebook after artist consents. On success sets auth cookies and redirects to ARTIST_WEB_HOST (or legacy WEB_HOST). On 2FA required, redirects to /login/2fa with a pending token.
     */
    get: operations['ArtistsOAuthController_facebookCallback_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/search': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Full-text search across tracks, artists, albums and playlists */
    get: operations['SearchController_search_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/search/history': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** List the caller's search history */
    get: operations['SearchController_getHistory_v1']
    put?: never
    post?: never
    /** Clear the caller's search history */
    delete: operations['SearchController_clearHistory_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/history/tracks/{trackId}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the record operation. */
    post: operations['HistoryController_record_v1']
    /** Runs the remove track operation. */
    delete: operations['HistoryController_removeTrack_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/history': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get history operation. */
    get: operations['HistoryController_getHistory_v1']
    put?: never
    post?: never
    /** Runs the clear all operation. */
    delete: operations['HistoryController_clearAll_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/browse/categories': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** List browse categories */
    get: operations['DiscoveryController_categories_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/browse/categories/{slug}/playlists': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** List playlists in a browse category */
    get: operations['DiscoveryController_categoryPlaylists_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/recommendations/feed': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Get the home feed
     * @description Anonymous callers get genre-agnostic sections. An authenticated caller gets tracks weighted toward their most-listened genres, plus an "On Repeat" section built from their own recent top tracks.
     */
    get: operations['DiscoveryController_feed_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/recommendations/related-artists/{artistId}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * List artists related to a given artist
     * @description Ranked by shared genres first, then monthly listeners and verification status.
     */
    get: operations['DiscoveryController_relatedArtists_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/charts/tracks': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Get the tracks chart
     * @description `global` and `country` cover the last 28 days; `viral` covers the last 7. `country` requires the `country` query param (ISO country name, case-insensitive).
     */
    get: operations['DiscoveryController_charts_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/me/top/tracks': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Get the caller's top tracks
     * @description `short` covers 28 days, `medium` covers 180 days, `long` covers roughly 10 years.
     */
    get: operations['DiscoveryController_topTracks_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/me/top/artists': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Get the caller's top artists
     * @description `short` covers 28 days, `medium` covers 180 days, `long` covers roughly 10 years.
     */
    get: operations['DiscoveryController_topArtists_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/me/settings': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Get the caller's settings
     * @description Returns the settings row for the authenticated user, creating it with defaults on first read.
     */
    get: operations['MeController_getSettings_v1']
    /**
     * Update the caller's settings
     * @description Every field is optional; only the fields present in the body are changed.
     */
    put: operations['MeController_updateSettings_v1']
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/me/player': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Get the caller's player state
     * @description Includes the active device, the current track, and the ordered queue.
     */
    get: operations['MeController_getPlayer_v1']
    /**
     * Update the caller's player state
     * @description Upserts the player state row. `deviceId` must belong to the caller and `currentTrackId` must be a ready track.
     */
    put: operations['MeController_updatePlayer_v1']
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/me/player/queue': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    /**
     * Replace the caller's play queue
     * @description Deletes the existing queue and recreates it in the given order. All ids must resolve to ready, undeleted tracks.
     */
    put: operations['MeController_updateQueue_v1']
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/me/player/devices': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** List the caller's playback devices */
    get: operations['MeController_devices_v1']
    put?: never
    /**
     * Register or update a playback device
     * @description With `id` set, updates a device the caller owns. Without `id`, creates a new one. Setting `isActive` deactivates every other device for the caller.
     */
    post: operations['MeController_upsertDevice_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/me/player/devices/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post?: never
    /** Remove one of the caller's playback devices */
    delete: operations['MeController_removeDevice_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/me/notifications': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** List the caller's notifications */
    get: operations['MeController_notifications_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/me/notifications/{id}/read': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    /** Mark a notification as read */
    put: operations['MeController_readNotification_v1']
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/me/notifications/read-all': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    /** Mark every one of the caller's notifications as read */
    put: operations['MeController_readAll_v1']
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/me/subscription': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Get the caller's subscription
     * @description Returns the most recent active subscription, or `{ plan: "FREE", status: "ACTIVE" }` when the caller has none.
     */
    get: operations['MeController_subscription_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/podcasts': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** List podcasts */
    get: operations['PodcastsController_getAll_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/podcasts/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Get a podcast by id, with its episodes */
    get: operations['PodcastsController_getById_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/me/episodes': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** List the caller's saved episodes */
    get: operations['PodcastsController_saved_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/me/episodes/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    /** Save an episode to the caller's library */
    put: operations['PodcastsController_save_v1']
    post?: never
    /** Remove an episode from the caller's library */
    delete: operations['PodcastsController_unsave_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** List the authenticated artist’s release workspaces */
    get: operations['ReleasesController_findAll_v1']
    put?: never
    /**
     * Create an artist-owned release draft
     * @description Creates a preparation workspace in DRAFT status. Does not publish or distribute music.
     */
    post: operations['ReleasesController_createDraft_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Read an owned active release workspace */
    get: operations['ReleasesController_findOne_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    /**
     * Edit an owned release draft
     * @description Updates title, type and/or planned schedule only in DRAFT status. Requires the previously read updatedAt version; concurrent changes return 409. Saving a schedule does not submit or deliver a release.
     */
    patch: operations['ReleasesController_updateDraft_v1']
    trace?: never
  }
  '/api/v1/releases/{id}/workspace': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Read an owned release with its schedule, tracks and participants */
    get: operations['ReleasesController_workspace_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases/{id}/contributors': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Add a credited participant to an owned draft
     * @description Requires the release updatedAt version and at least one unique role. The credit grants no account access and does not set rights or splits. A rejected write changes neither release nor credits.
     */
    post: operations['ReleasesController_addContributor_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases/{id}/contributors/{contributorId}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Read a credited participant and current release version
     * @description Owned active release only. Includes credits with no roles so they can be corrected; never exposes account links or splits.
     */
    get: operations['ReleasesController_contributor_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    /**
     * Edit a credited participant in an owned draft
     * @description Provide name, unique roles and expectedUpdatedAt. The release version and selected credit are changed in one transaction. Credit identity, artist link and splits are preserved.
     */
    patch: operations['ReleasesController_updateContributor_v1']
    trace?: never
  }
  '/api/v1/releases/{id}/rights': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    /**
     * Confirm the rights of an owned draft
     * @description Replaces the master owner and both confirmations in one request, so each confirmation describes the saved owner. Changing credits later clears both confirmations; changing splits clears accuracy.
     */
    patch: operations['ReleasesController_updateRights_v1']
    trace?: never
  }
  '/api/v1/releases/{id}/splits': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    /**
     * Replace the splits of one right type on an owned draft
     * @description Replaces every share of the given right type. Drafts may stay below 100% but never exceed it; submission requires exactly 100% for recording and composition. Clears the accuracy confirmation.
     */
    put: operations['ReleasesController_replaceSplits_v1']
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases/{id}/tracks/{trackId}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    /**
     * Set the ISRC of a recording on an owned draft
     * @description Accepts the code with or without hyphens and stores it compact. Optional for submission; a distributor can assign one later.
     */
    patch: operations['ReleasesController_updateTrack_v1']
    trace?: never
  }
  '/api/v1/releases/{id}/submit': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Submit an owned draft for Bitrate review
     * @description Re-checks every blocker in the same transaction and moves DRAFT to SUBMITTED. Creates an internal review request only; it does not deliver the release to streaming services. Missing UPC/ISRC never blocks.
     */
    post: operations['ReleasesController_submit_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases/{id}/withdraw': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Withdraw a submitted release back to its draft
     * @description Allowed while the release awaits Bitrate review; saved data is kept.
     */
    post: operations['ReleasesController_withdraw_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artist-music/counts': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Count owned active Music tracks and releases */
    get: operations['ArtistMusicController_counts_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artist-music/tracks': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** List the authenticated artist’s private Music tracks */
    get: operations['ArtistMusicController_tracks_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artist-music/releases': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** List the authenticated artist’s private Music releases */
    get: operations['ArtistMusicController_releases_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/moderation/reports': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * File a moderation report
     * @description Reporting the same entity again while an earlier report is still active returns that report instead of creating a duplicate. Rate-limited per reporter.
     */
    post: operations['ModerationController_create_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/auth/login': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the login operation. */
    post: operations['AdminAuthController_login_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/auth/logout': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the logout operation. */
    post: operations['AdminAuthController_logout_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/auth/refresh': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the refresh operation. */
    post: operations['AdminAuthController_refresh_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/auth/me': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get me operation. */
    get: operations['AdminAuthController_getMe_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/moderation/reports': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the list reports operation. */
    get: operations['AdminModerationController_list_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/moderation/reports/batch/resolve': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Runs the batch resolve operation. Declared before `:id` so the literal `batch` segment is
     *     never read as an id. `@SkipAudit` because the service writes one audit row per report.
     * @description Each id is processed independently with the single-entity rules. Always 200 with a per-id result; failed ids carry an error code and message. Requires reports:advance.
     */
    post: operations['AdminModerationController_resolveMany_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/moderation/reports/batch/dismiss': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Runs the batch dismiss operation (status `REJECTED`); see {@link resolveMany}.
     * @description Each id is processed independently with the single-entity rules. Always 200 with a per-id result; failed ids carry an error code and message. Requires reports:advance.
     */
    post: operations['AdminModerationController_dismissMany_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/moderation/reports/export.csv': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the CSV export operation.
     * @description Streams the reports matching the queue filters and sort as CSV. Administrator-only by default (reports:export). Writes one audit row (admin-moderation.export).
     */
    get: operations['AdminModerationController_exportCsv_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/moderation/reports/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get report operation. */
    get: operations['AdminModerationController_getById_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    /** Runs the update report operation. */
    patch: operations['AdminModerationController_update_v1']
    trace?: never
  }
  '/api/v1/admin/artists': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the list artists operation. */
    get: operations['AdminArtistsController_list_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/artists/export.csv': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the CSV export operation.
     * @description Streams the artists matching the list filters and sort as CSV. Administrator-only by default (artists:export): the file contains email addresses. Writes one audit row (admin-artists.export).
     */
    get: operations['AdminArtistsController_exportCsv_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/artists/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get artist operation. */
    get: operations['AdminArtistsController_getById_v1']
    put?: never
    post?: never
    /** Runs the soft-delete operation. */
    delete: operations['AdminArtistsController_remove_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/artists/{id}/tracks': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the list artist tracks operation. Permission is `artists:read` — this is a sub-view of
     *     the artist detail page (the same permission that already backs its `counts.tracks`), not
     *     the global track-management surface behind `tracks:read`.
     */
    get: operations['AdminArtistsController_listTracks_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/artists/{id}/albums': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the list artist albums operation. Permission is `artists:read`, for the same reason
     *     as {@link listTracks}.
     */
    get: operations['AdminArtistsController_listAlbums_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/artists/{id}/verification': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    /** Runs the update verification operation. */
    patch: operations['AdminArtistsController_updateVerification_v1']
    trace?: never
  }
  '/api/v1/admin/artists/{id}/restore': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the restore operation. */
    post: operations['AdminArtistsController_restore_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/artists/{id}/sessions/revoke': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the revoke sessions operation. */
    post: operations['AdminArtistsController_revokeSessions_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/users': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the list users operation. */
    get: operations['AdminUsersController_list_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/users/export.csv': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the CSV export operation.
     * @description Streams the users matching the list filters and sort as CSV. Administrator-only by default (users:export): the file contains email addresses. Writes one audit row (admin-users.export).
     */
    get: operations['AdminUsersController_exportCsv_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/users/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get user operation. */
    get: operations['AdminUsersController_getById_v1']
    put?: never
    post?: never
    /** Runs the soft-delete operation. */
    delete: operations['AdminUsersController_remove_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/users/{id}/listening-history': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the list listening history operation. */
    get: operations['AdminUsersController_listListeningHistory_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/users/batch/deactivate': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Runs the batch deactivate operation. `@SkipAudit` because each take-down audits itself.
     * @description Each id is processed independently with the single-entity rules. Always 200 with a per-id result; failed ids carry an error code and message. Requires users:delete.
     */
    post: operations['AdminUsersController_deactivateMany_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/users/{id}/restore': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the restore operation. */
    post: operations['AdminUsersController_restore_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/users/{id}/sessions/revoke': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the revoke sessions operation. */
    post: operations['AdminUsersController_revokeSessions_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/tracks': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the list tracks operation.
     * @description Sorted problem-first by default: FAILED, then the longest-stuck PROCESSING rows, then everything else. Passing `sort` replaces that attention-first default with a plain ordering on the chosen field.
     */
    get: operations['AdminTracksController_list_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/tracks/export.csv': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the CSV export operation.
     * @description Streams the tracks matching the list filters and ordering as CSV, in the list order (problem-first unless `sort` is given). Administrator-only by default (tracks:export). Writes one audit row (admin-tracks.export).
     */
    get: operations['AdminTracksController_exportCsv_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/tracks/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get track operation. */
    get: operations['AdminTracksController_getById_v1']
    put?: never
    post?: never
    /** Runs the soft-delete (take-down) operation. */
    delete: operations['AdminTracksController_remove_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/tracks/{id}/audio': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the stream audio operation.
     * @description Serves the highest-bitrate CMAF rendition by default, or the one named by `bitrate`, honoring an inclusive `bytes=` Range. Playable even for a taken-down track, so an operator can review it before deciding whether to restore it.
     */
    get: operations['AdminTracksController_streamAudio_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    /**
     * Runs the probe audio operation — headers only, no storage round-trip.
     *     Declared before {@link streamAudio} so Express matches HEAD here rather than
     *     falling through to the GET handler for the same path.
     * @description Confirms the session is live and the rendition is playable — headers only, no body, no storage round-trip.
     */
    head: operations['AdminTracksController_probeAudio_v1']
    patch?: never
    trace?: never
  }
  '/api/v1/admin/tracks/{id}/processing-attempts': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the list processing attempts operation.
     * @description Newest first. Soft-deleted tracks are still reachable.
     */
    get: operations['AdminTracksController_listProcessingAttempts_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/tracks/{id}/reprocess': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the reprocess operation. */
    post: operations['AdminTracksController_reprocess_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/tracks/batch/take-down': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Runs the batch take-down operation. `@SkipAudit` because each take-down audits itself.
     * @description Each id is processed independently with the single-entity rules. Always 200 with a per-id result; failed ids carry an error code and message. Requires tracks:delete.
     */
    post: operations['AdminTracksController_takeDownMany_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/tracks/{id}/restore': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the restore operation. */
    post: operations['AdminTracksController_restore_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/audit': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the list audit logs operation. */
    get: operations['AdminAuditController_list_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/roles': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the list roles operation. */
    get: operations['AdminRolesController_list_v1']
    put?: never
    /** Runs the create role operation. */
    post: operations['AdminRolesController_create_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/roles/permissions': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the list permissions operation. Declared before `:id` so `permissions` is never
     *     swallowed by the dynamic route.
     */
    get: operations['AdminRolesController_permissions_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/roles/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get role operation. */
    get: operations['AdminRolesController_getById_v1']
    put?: never
    post?: never
    /** Runs the delete role operation. */
    delete: operations['AdminRolesController_remove_v1']
    options?: never
    head?: never
    /** Runs the update role operation. */
    patch: operations['AdminRolesController_update_v1']
    trace?: never
  }
  '/api/v1/admin/staff': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the list staff operation. */
    get: operations['AdminStaffController_list_v1']
    put?: never
    /** Runs the create staff operation. */
    post: operations['AdminStaffController_create_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/staff/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get staff operation. */
    get: operations['AdminStaffController_getById_v1']
    put?: never
    post?: never
    /** Runs the deactivate operation. */
    delete: operations['AdminStaffController_remove_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/staff/{id}/role': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    /** Runs the assign role operation. */
    patch: operations['AdminStaffController_assignRole_v1']
    trace?: never
  }
  '/api/v1/admin/staff/{id}/permissions': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    /** Runs the update permissions operation. */
    patch: operations['AdminStaffController_updatePermissions_v1']
    trace?: never
  }
  '/api/v1/admin/overview': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get overview operation. */
    get: operations['AdminOverviewController_get_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/overview/series': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the get overview series operation.
     * @description Zero-filled daily series over a trailing window of UTC calendar days, defaulting to 30 and capped at 365.
     */
    get: operations['AdminOverviewController_getSeries_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/overview/reports-by-type': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the get overview reports-by-type operation.
     * @description Zero-filled daily counts of reports created in a trailing window of UTC calendar days, one series per entity type. Defaults to 30 days, capped at 365.
     */
    get: operations['AdminOverviewController_getReportsByType_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/genres': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the list genres operation. */
    get: operations['AdminGenresController_list_v1']
    put?: never
    /** Runs the create genre operation. */
    post: operations['AdminGenresController_create_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/genres/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get genre operation. */
    get: operations['AdminGenresController_getById_v1']
    put?: never
    post?: never
    /** Runs the delete genre operation. Refused with 409 while the genre is referenced. */
    delete: operations['AdminGenresController_remove_v1']
    options?: never
    head?: never
    /** Runs the update genre operation. */
    patch: operations['AdminGenresController_update_v1']
    trace?: never
  }
  '/api/v1/admin/albums': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the list albums operation. */
    get: operations['AdminAlbumsController_list_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/albums/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the get album operation.
     * @description A taken-down album stays reachable by id so it can be reviewed and restored.
     */
    get: operations['AdminAlbumsController_getById_v1']
    put?: never
    post?: never
    /**
     * Runs the soft-delete (take-down) operation.
     * @description The album's tracks are not affected and stay independently manageable.
     */
    delete: operations['AdminAlbumsController_remove_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/albums/{id}/restore': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the restore operation. */
    post: operations['AdminAlbumsController_restore_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/playlists': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the list playlists operation.
     * @description Only public playlists are listed; private ones are user content. A playlist an operator hid leaves this list and stays reachable by id.
     */
    get: operations['AdminPlaylistsController_list_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/playlists/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the get playlist operation.
     * @description Not restricted to public playlists: a hidden or taken-down playlist stays reachable so it can be reviewed and reversed.
     */
    get: operations['AdminPlaylistsController_getById_v1']
    put?: never
    post?: never
    /**
     * Runs the soft-delete (take-down) operation.
     * @description The harder tier: stamps `deletedAt`. The playlist's visibility is untouched.
     */
    delete: operations['AdminPlaylistsController_remove_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/playlists/{id}/visibility': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    /**
     * Runs the hide / un-hide operation.
     * @description `isPublic: false` hides; `isPublic: true` un-hides. Neither changes the take-down state. A private playlist with no operator hide on record cannot be un-hidden.
     */
    patch: operations['AdminPlaylistsController_setVisibility_v1']
    trace?: never
  }
  '/api/v1/admin/playlists/{id}/restore': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Runs the restore operation.
     * @description Clears `deletedAt` only; a hidden playlist stays hidden.
     */
    post: operations['AdminPlaylistsController_restore_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/podcasts': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the list podcasts operation. */
    get: operations['AdminPodcastsController_list_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/podcasts/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Runs the get podcast operation.
     * @description A taken-down podcast stays reachable by id, and every episode is listed with its own take-down state.
     */
    get: operations['AdminPodcastsController_getById_v1']
    put?: never
    post?: never
    /**
     * Runs the soft-delete (take-down) operation.
     * @description The podcast's episodes are not affected and stay independently manageable.
     */
    delete: operations['AdminPodcastsController_remove_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/podcasts/{id}/restore': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the restore operation. */
    post: operations['AdminPodcastsController_restore_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/podcasts/{id}/episodes/{episodeId}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post?: never
    /**
     * Runs the episode soft-delete (take-down) operation.
     * @description The parent podcast and the other episodes are not affected.
     */
    delete: operations['AdminPodcastsController_removeEpisode_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/podcasts/{id}/episodes/{episodeId}/restore': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Runs the episode restore operation. */
    post: operations['AdminPodcastsController_restoreEpisode_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
}
export type webhooks = Record<string, never>
export interface components {
  schemas: {
    UserSessionEntity: {
      /** @description The id value. */
      id: string
      /** @description The user id value. */
      userId: string
      /** @description The access token value. */
      access_token: string
      /** @description The refresh token value. */
      refresh_token: string
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The expires at value.
       */
      expiresAt: string
    }
    SelfUserEntity: {
      /** @description The id value. */
      id: string
      /** @description The username value. */
      username: string
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /** @description The description value. */
      description: string | null
      /** @description The avatar value. */
      avatar: string | null
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /** @description The email value. */
      email: string
      /**
       * Format: date-time
       * @description When the address was confirmed, or null while it is still unverified.
       */
      emailVerifiedAt: string | null
      /** @description Whether two-factor authentication is switched on. */
      twoFactorEnabled: boolean
      /** @description Revision of the legal documents the account accepted, or null when none was recorded. */
      legalVersion: string | null
      /** @description Whether the account must accept the current legal documents before carrying on. */
      legalAcceptanceRequired: boolean
    }
    TwoFactorRequiredEntity: {
      /**
       * @description Always true — signals the client must complete the 2FA challenge.
       * @example true
       */
      requires2fa: boolean
      /**
       * @description Short-lived token identifying the pending login, submitted with the 2FA code.
       * @example eyJhbGciOiJIUzI1NiJ9...
       */
      pendingToken: string
    }
    UserLoginDto: {
      /**
       * @description User email
       * @example user@example.com
       */
      email: string
      /**
       * @description User password
       * @example password123
       */
      password: string
    }
    RegistrationDto: {
      /**
       * @description New user email
       * @example newuser@example.com
       */
      email: string
      /**
       * @description New user password
       * @example password123
       */
      password: string
      /**
       * @description New user username
       * @example newuser123
       */
      username: string
      /**
       * @description Accepts the Terms of Use and Community Guidelines and acknowledges the Privacy Policy; must be true
       * @example true
       * @enum {boolean}
       */
      acceptLegal: true
    }
    LegalAcceptanceDto: {
      /**
       * @description Accepts the current Terms of Use and Community Guidelines and acknowledges the Privacy Policy; must be true
       * @example true
       * @enum {boolean}
       */
      acceptLegal: true
    }
    UserForgotPasswordDto: {
      /**
       * @description The email value.
       * @example user@example.com
       */
      email: string
    }
    ResetPasswordDto: {
      /**
       * @description The token value.
       * @example a3f2c1...
       */
      token: string
      /**
       * @description The password value.
       * @example newSecurePassword123
       */
      password: string
    }
    VerifyEmailDto: {
      token: string
    }
    ResendEmailVerificationDto: {
      /** Format: email */
      email: string
    }
    UserTwoFactorSetupEntity: {
      /**
       * @description Base64 data URL of a QR code encoding the TOTP enrollment URI, ready to render in an `<img>`.
       * @example data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
       */
      qrCodeDataUrl: string
      /**
       * @description The raw TOTP secret, for manual entry when the user cannot scan the QR code.
       * @example JBSWY3DPEHPK3PXP
       */
      manualCode: string
    }
    TwoFactorCodeDto: {
      /**
       * @description 6-digit TOTP code
       * @example 123456
       */
      code: string
    }
    TwoFactorVerifyLoginDto: {
      /**
       * @description Pending 2FA session token from login
       * @example eyJhbGciOiJIUzI1NiJ9...
       */
      pendingToken: string
      /**
       * @description 6-digit TOTP code
       * @example 123456
       */
      code: string
    }
    UserEntity: {
      /** @description The id value. */
      id: string
      /** @description The username value. */
      username: string
      /** @description The email value. */
      email: string
      /** @description The password value. */
      password: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /** @description The description value. */
      description: string | null
      /** @description The avatar value. */
      avatar: string | null
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /** @description The two factor secret value. */
      twoFactorSecret: string | null
      /** @description The two factor enabled value. */
      twoFactorEnabled: boolean
      /**
       * Format: date-time
       * @description Email verification timestamp.
       */
      emailVerifiedAt: string | null
      /** @description Consecutive failed login attempts. */
      failedLoginAttempts: number
      /**
       * Format: date-time
       * @description Account lock expiration timestamp.
       */
      lockedUntil: string | null
      /**
       * Format: date-time
       * @description Soft deletion timestamp.
       */
      deletedAt: string | null
      /** @description Transactional-email locale, set at registration from Accept-Language. */
      locale: string
      /** @description Revision of the Terms of Use, Community Guidelines and Privacy Policy accepted at registration, if recorded. */
      legalVersion: string | null
      /**
       * Format: date-time
       * @description When that revision was accepted, if recorded.
       */
      legalAcceptedAt: string | null
    }
    SafeUserEntity: {
      /** @description The id value. */
      id: string
      /** @description The username value. */
      username: string
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /** @description The description value. */
      description: string | null
      /** @description The avatar value. */
      avatar: string | null
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
    }
    UpdateUserDto: {
      /**
       * @description Username of the user
       * @example john_doe
       */
      username: string
      /**
       * @description Description of the user
       * @example This is a sample description
       */
      description?: string
    }
    UploadAvatarDto: {
      /**
       * Format: binary
       * @description User avatar
       */
      avatar: string
    }
    ArtistEntity: {
      /** @description The id value. */
      id: string
      /** @description The username value. */
      username: string
      /** @description The password value. */
      password: string | null
      /** @description The email value. */
      email: string
      /** @description The bio value. */
      bio: string | null
      /** @description The avatar value. */
      avatar: string | null
      /** @description The background image value. */
      backgroundImage: string | null
      /** @description The two factor secret value. */
      twoFactorSecret: string | null
      /** @description The two factor enabled value. */
      twoFactorEnabled: boolean
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /**
       * Format: date-time
       * @description Email verification timestamp.
       */
      emailVerifiedAt: string | null
      /** @description Consecutive failed login attempts. */
      failedLoginAttempts: number
      /**
       * Format: date-time
       * @description Account lock expiration timestamp.
       */
      lockedUntil: string | null
      /** @description Whether the artist profile is verified. */
      verified: boolean
      /** @description Cached monthly listener count. */
      monthlyListeners: number
      /** @description Artist country code. */
      country: string | null
      /** @description Social profile metadata. */
      socials: Record<string, never> | null
      /**
       * Format: date-time
       * @description Soft deletion timestamp.
       */
      deletedAt: string | null
      /** @description Transactional-email locale, set at registration from Accept-Language. */
      locale: string
      /** @description Revision of the Terms of Use, Community Guidelines and Privacy Policy accepted at registration, if recorded. */
      legalVersion: string | null
      /**
       * Format: date-time
       * @description When that revision was accepted, if recorded.
       */
      legalAcceptedAt: string | null
      /** @description Revision of the Artist Agreement accepted at registration, if recorded. */
      artistAgreementVersion: string | null
      /**
       * Format: date-time
       * @description When the Artist Agreement was accepted, if recorded.
       */
      artistAgreementAcceptedAt: string | null
    }
    SafeArtistEntity: {
      /** @description The id value. */
      id: string
      /** @description The username value. */
      username: string
      /** @description The bio value. */
      bio: string | null
      /** @description The avatar value. */
      avatar: string | null
      /** @description The background image value. */
      backgroundImage: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /** @description Whether the artist profile is verified. */
      verified: boolean
      /** @description Cached monthly listener count. */
      monthlyListeners: number
      /** @description Artist country code. */
      country: string | null
      /** @description Social profile metadata. */
      socials: Record<string, never> | null
    }
    UpdateArtistDto: {
      /** @description The username value. */
      username?: string
      /** @description The bio value. */
      bio?: string
      /** @description The avatar value. */
      avatar?: string
      /** @description The background image value. */
      backgroundImage?: string
    }
    ArtistFollowersCountEntity: {
      /** @description The artist's current follower count. */
      followers: number
    }
    FollowedArtistEntity: {
      /** @description The id value. */
      id: string
      /** @description The username value. */
      username: string
      /** @description The bio value. */
      bio: string | null
      /** @description The avatar value. */
      avatar: string | null
      /** @description The background image value. */
      backgroundImage: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /** @description Whether the artist profile is verified. */
      verified: boolean
      /** @description Cached monthly listener count. */
      monthlyListeners: number
      /** @description Artist country code. */
      country: string | null
      /** @description Social profile metadata. */
      socials: Record<string, never> | null
      /** @description Aggregate counters for this artist. */
      _count: components['schemas']['ArtistFollowersCountEntity']
      /**
       * Format: date-time
       * @description When the current user started following this artist.
       */
      followedAt: string
    }
    ArtistWithFollowersCountEntity: {
      /** @description The id value. */
      id: string
      /** @description The username value. */
      username: string
      /** @description The bio value. */
      bio: string | null
      /** @description The avatar value. */
      avatar: string | null
      /** @description The background image value. */
      backgroundImage: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /** @description Whether the artist profile is verified. */
      verified: boolean
      /** @description Cached monthly listener count. */
      monthlyListeners: number
      /** @description Artist country code. */
      country: string | null
      /** @description Social profile metadata. */
      socials: Record<string, never> | null
      /** @description Aggregate counters for this artist. */
      _count: components['schemas']['ArtistFollowersCountEntity']
    }
    TrackEntity: {
      /** @description The id value. */
      id: string
      /** @description The title value. */
      title: string
      /** @description The audio url value. */
      audioUrl: string
      /** @description The cover value. */
      cover: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /** @description The artist id value. */
      artistId: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /** @description The duration value. */
      duration: number | null
      /**
       * Format: date-time
       * @description The release date value.
       */
      releaseDate: string | null
      /** @description The lyrics value. */
      lyrics: string | null
      /**
       * @description The processing status value.
       * @enum {string}
       */
      processingStatus: 'PROCESSING' | 'READY' | 'FAILED'
      /** @description The processing error value. */
      processingError: string | null
      /** @description The processing attempts value. */
      processingAttempts: number
      /**
       * Format: date-time
       * @description The processing started at value.
       */
      processingStartedAt: string | null
      /**
       * Format: date-time
       * @description The processing finished at value.
       */
      processingFinishedAt: string | null
      /** @description 1 = legacy HLS pipeline, 2 = single-file CMAF + Range index (ADR-0020). */
      playbackVersion: number
      /** @description Fragment timescale shared by every CMAF rendition; null on legacy tracks. */
      fragmentTimescale: number | null
      /** @description Track duration in fragment ticks; null on legacy tracks. */
      durationTicks: number | null
      /** @description Whether the track contains explicit content. */
      explicit: boolean
      /** @description Popularity score used by discovery and charts. */
      popularity: number
      /** @description Number of recorded plays. */
      playCount: number
      /** @description International Standard Recording Code. */
      isrc: string | null
      /** @description Optional short preview URL. */
      previewUrl: string | null
      /** @description Position within an album disc. */
      trackNumber: number | null
      /** @description Disc number within an album. */
      discNumber: number
      /** @description ISO language code when known. */
      language: string | null
      /**
       * Format: date-time
       * @description Soft deletion timestamp.
       */
      deletedAt: string | null
    }
    TrackManifestRenditionEntity: {
      /**
       * @description Bitrate in kbps.
       * @example 192
       */
      bitrate: number
      /**
       * @description RFC 6381 codec string for `MediaSource.isTypeSupported`.
       * @example mp4a.40.2
       */
      codec: string
      /**
       * @description Total file size in bytes.
       * @example 1456523
       */
      size: number
      /**
       * @description Inclusive byte range of the MSE initialization segment (`ftyp`+`moov`).
       *     The `sidx` index is parsed server-side and deliberately excluded.
       * @example [
       *       0,
       *       707
       *     ]
       */
      initRange: number[]
      /**
       * @description One entry per fragment: `[startTicks, durationTicks, offset, length]`.
       *     Offsets and lengths are absolute byte positions in the rendition file;
       *     a Range request uses `bytes=offset-(offset+length-1)`.
       * @example [
       *       [
       *         0,
       *         195584,
       *         929,
       *         98987
       *       ],
       *       [
       *         195584,
       *         196608,
       *         99916,
       *         99228
       *       ]
       *     ]
       */
      fragments: number[][]
    }
    TrackManifestEntity: {
      /**
       * @description Manifest schema version; bumped when fragment semantics change.
       * @example 1
       */
      version: number
      /**
       * @description Ticks per second shared by every rendition.
       * @example 48000
       */
      timescale: number
      /**
       * @description Track duration in ticks.
       * @example 2880000
       */
      durationTicks: number
      /**
       * @description Track duration in milliseconds, derived from `durationTicks`.
       * @example 60000
       */
      durationMs: number
      /** @description Renditions ordered from the lowest bitrate to the highest. */
      renditions: components['schemas']['TrackManifestRenditionEntity'][]
    }
    CreateTrackDto: {
      /** @description Track title */
      title: string
      /**
       * @description Confirms you hold the rights to this recording; must be true
       * @example true
       * @enum {boolean}
       */
      rightsConfirmed: true
      /**
       * Format: binary
       * @description Audio file
       */
      audio: string
      /**
       * Format: binary
       * @description Cover image file
       */
      cover?: string
    }
    UpdateTrackDto: {
      /** @description Track title */
      title: string
      /**
       * @description Confirms you hold the rights to the replacement recording; required with new audio
       * @example true
       * @enum {boolean}
       */
      rightsConfirmed?: true
      /**
       * Format: binary
       * @description Replacement audio file
       */
      audio?: string
      /**
       * Format: binary
       * @description Cover image file
       */
      cover?: string
    }
    PlaylistEntity: {
      /** @description The id value. */
      id: string
      /** @description The title value. */
      title: string
      /** @description The cover value. */
      cover: string
      /** @description The description value. */
      description: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /** @description The user id value. */
      userId: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /** @description The is public value. */
      isPublic: boolean
      /** @description Whether collaborators may modify the playlist. */
      collaborative: boolean
      /** @description Cached number of users following the playlist. */
      followersCount: number
      /**
       * Format: date-time
       * @description Soft deletion timestamp.
       */
      deletedAt: string | null
    }
    PlaylistTrackEntity: {
      /** @description The id value. */
      id: string
      /** @description The title value. */
      title: string
      /** @description The audio url value. */
      audioUrl: string
      /** @description The cover value. */
      cover: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /** @description The artist id value. */
      artistId: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /** @description The duration value. */
      duration: number | null
      /**
       * Format: date-time
       * @description The release date value.
       */
      releaseDate: string | null
      /** @description The lyrics value. */
      lyrics: string | null
      /**
       * @description The processing status value.
       * @enum {string}
       */
      processingStatus: 'PROCESSING' | 'READY' | 'FAILED'
      /** @description The processing error value. */
      processingError: string | null
      /** @description The processing attempts value. */
      processingAttempts: number
      /**
       * Format: date-time
       * @description The processing started at value.
       */
      processingStartedAt: string | null
      /**
       * Format: date-time
       * @description The processing finished at value.
       */
      processingFinishedAt: string | null
      /** @description 1 = legacy HLS pipeline, 2 = single-file CMAF + Range index (ADR-0020). */
      playbackVersion: number
      /** @description Fragment timescale shared by every CMAF rendition; null on legacy tracks. */
      fragmentTimescale: number | null
      /** @description Track duration in fragment ticks; null on legacy tracks. */
      durationTicks: number | null
      /** @description Whether the track contains explicit content. */
      explicit: boolean
      /** @description Popularity score used by discovery and charts. */
      popularity: number
      /** @description Number of recorded plays. */
      playCount: number
      /** @description International Standard Recording Code. */
      isrc: string | null
      /** @description Optional short preview URL. */
      previewUrl: string | null
      /** @description Position within an album disc. */
      trackNumber: number | null
      /** @description Disc number within an album. */
      discNumber: number
      /** @description ISO language code when known. */
      language: string | null
      /**
       * Format: date-time
       * @description Soft deletion timestamp.
       */
      deletedAt: string | null
      /** @description The id of the row joining this track to the playlist. */
      playlistTrackId: string
      /** @description The track's 1-based position within the playlist. */
      position: number
      /**
       * Format: date-time
       * @description When the track was added to the playlist.
       */
      addedAt: string
      /** @description The id of the user who added the track, when known. */
      addedById: string | null
    }
    PlaylistOwnerEntity: {
      /** @description The owning user's id. */
      id: string
      /** @description The owning user's username. */
      username: string
      /** @description The owning user's avatar URL. */
      avatar: string | null
    }
    PlaylistDetailEntity: {
      /** @description The id value. */
      id: string
      /** @description The title value. */
      title: string
      /** @description The cover value. */
      cover: string
      /** @description The description value. */
      description: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /** @description The user id value. */
      userId: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /** @description The is public value. */
      isPublic: boolean
      /** @description Whether collaborators may modify the playlist. */
      collaborative: boolean
      /** @description Cached number of users following the playlist. */
      followersCount: number
      /**
       * Format: date-time
       * @description Soft deletion timestamp.
       */
      deletedAt: string | null
      /** @description The playlist's tracks, in position order. */
      tracks: components['schemas']['PlaylistTrackEntity'][]
      /** @description The playlist's owner. */
      user: components['schemas']['PlaylistOwnerEntity']
    }
    UpdatePlaylistDto: {
      /** @description Playlist title */
      title: string
      /** @example user123 */
      description?: string
    }
    AddTracksDto: {
      /** @description Array of track IDs to add */
      trackIds: string[]
    }
    AlbumEntity: {
      /** @description The id value. */
      id: string
      /** @description The title value. */
      title: string
      /** @description The cover value. */
      cover: string | null
      /** @description The artist id value. */
      artistId: string
      /** @description The description value. */
      description: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /**
       * Format: date-time
       * @description The release date value.
       */
      releaseDate: string | null
      /**
       * @description The release kind.
       * @enum {string}
       */
      type: 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION'
      /** @description The record label. */
      label: string | null
      /** @description Cached number of tracks. */
      totalTracks: number
      /** @description Copyright information. */
      copyright: string | null
      /**
       * Format: date-time
       * @description Soft deletion timestamp.
       */
      deletedAt: string | null
    }
    CreateAlbumDto: {
      /** @description Playlist title */
      title: string
      /** @example user123 */
      description?: string
      /**
       * @description Confirms you hold the rights to this album; must be true
       * @example true
       * @enum {boolean}
       */
      rightsConfirmed: true
    }
    UpdateAlbumDto: {
      /** @description Playlist title */
      title: string
      /** @example user123 */
      description?: string
    }
    ArtistSessionEntity: {
      /** @description The id value. */
      id: string
      /** @description The artist id value. */
      artistId: string
      /** @description The access token value. */
      access_token: string
      /** @description The refresh token value. */
      refresh_token: string
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The expires at value.
       */
      expiresAt: string
    }
    ArtistLoginDto: {
      /**
       * @description Artist email
       * @example artist@example.com
       */
      email: string
      /**
       * @description User password
       * @example password123
       */
      password: string
    }
    ArtistRegistrationDto: {
      /**
       * @description New user email
       * @example newuser@example.com
       */
      email: string
      /**
       * @description New user password
       * @example password123
       */
      password: string
      /**
       * @description New user username
       * @example newuser123
       */
      username: string
      /**
       * @description Accepts the Terms of Use and Community Guidelines and acknowledges the Privacy Policy; must be true
       * @example true
       * @enum {boolean}
       */
      acceptLegal: true
      /**
       * @description Accepts the Artist Agreement; must be true
       * @example true
       * @enum {boolean}
       */
      acceptArtistAgreement: true
    }
    ArtistRegistrationEntity: {
      /** @enum {string} */
      delivery: 'email' | 'development' | 'unavailable'
      /** @enum {boolean} */
      requiresEmailVerification: true
    }
    ArtistForgotPasswordDto: {
      /**
       * @description The email value.
       * @example artist@example.com
       */
      email: string
    }
    VerifyArtistEmailDto: {
      token: string
    }
    ResendArtistEmailDto: {
      /** Format: email */
      email: string
    }
    ArtistEmailDeliveryEntity: {
      /** @enum {string} */
      delivery: 'email' | 'development' | 'unavailable'
    }
    VerifyArtistEmailCodeDto: {
      /** Format: email */
      email: string
      code: string
    }
    ArtistTwoFactorSetupEntity: {
      /**
       * @description Base64 data URL of a QR code encoding the TOTP enrollment URI, ready to render in an `<img>`.
       * @example data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
       */
      qrCodeDataUrl: string
      /**
       * @description The raw TOTP secret, for manual entry when the artist cannot scan the QR code.
       * @example JBSWY3DPEHPK3PXP
       */
      manualCode: string
    }
    SearchResultEntity: {
      /** @description The id value. */
      id: string
      /** @description The title value. */
      title: string
      /** @description The subtitle value. */
      subtitle: string | null
      /** @description The image value. */
      image: string | null
      /**
       * @description Which bucket this result came from.
       * @enum {string}
       */
      type: 'tracks' | 'artists' | 'albums' | 'playlists'
      /** @description Full-text search relevance rank. */
      rank: number
      /** @description The owning artist's id, when the result is artist-scoped. */
      artistId: string | null
      /** @description The owning user's id, when the result is user-scoped. */
      ownerId: string | null
    }
    SearchResultsByTypeEntity: {
      /** @description Matching tracks. */
      tracks: components['schemas']['SearchResultEntity'][]
      /** @description Matching artists. */
      artists: components['schemas']['SearchResultEntity'][]
      /** @description Matching albums. */
      albums: components['schemas']['SearchResultEntity'][]
      /** @description Matching playlists. */
      playlists: components['schemas']['SearchResultEntity'][]
    }
    SearchTotalsByTypeEntity: {
      /** @description Matching track count. */
      tracks: number
      /** @description Matching artist count. */
      artists: number
      /** @description Matching album count. */
      albums: number
      /** @description Matching playlist count. */
      playlists: number
    }
    SearchResponseEntity: {
      /** @description Results grouped by bucket. */
      data: components['schemas']['SearchResultsByTypeEntity']
      /** @description Result count per bucket. */
      totals: components['schemas']['SearchTotalsByTypeEntity']
      /** @description Total results across every bucket. */
      total: number
      /** @description Current page, shared across every bucket. */
      page: number
      /** @description Page size, shared across every bucket. */
      limit: number
      /** @description Maximum results returned in each bucket. */
      limitPerType: number
      /** @description The single highest-ranked result across every bucket, when any results were found. */
      topResult: components['schemas']['SearchResultEntity'] | null
    }
    HistoryEntryRecordedEntity: {
      /** @description The id of the new listening history row. */
      id: string
      /**
       * Format: date-time
       * @description When the listen was recorded.
       */
      listenedAt: string
    }
    HistoryTrackArtistEntity: {
      /** @description The artist's id. */
      id: string
      /** @description The artist's username. */
      username: string
      /** @description The artist's avatar URL. */
      avatar: string | null
    }
    HistoryTrackEntity: {
      /** @description The track's id. */
      id: string
      /** @description The track's title. */
      title: string
      /** @description The track's cover URL. */
      cover: string | null
      /** @description The track's duration in seconds. */
      duration: number | null
      /** @description The owning artist's id. */
      artistId: string
      /** @description The owning artist's summary. */
      artist: components['schemas']['HistoryTrackArtistEntity']
    }
    HistoryEntryEntity: {
      /** @description The id of the most recent listen for this track. */
      id: string
      /**
       * Format: date-time
       * @description When the track was last listened to.
       */
      listenedAt: string
      /** @description The listened track's id. */
      trackId: string
      /** @description The listened track's summary. */
      track: components['schemas']['HistoryTrackEntity']
    }
    UpdateSettingsDto: {
      language?: string
      /** @enum {string} */
      streamingQuality?: 'automatic' | 'low' | 'normal' | 'high' | 'very-high'
      normalizeVolume?: boolean
      compactLibrary?: boolean
      showNowPlaying?: boolean
      autoplay?: boolean
      explicitContent?: boolean
      privateSession?: boolean
    }
    UpdatePlayerDto: {
      deviceId?: string | null
      currentTrackId?: string | null
      contextType?: ('playlist' | 'album' | 'artist' | 'queue') | null
      contextId?: string | null
      positionMs?: number
      isPlaying?: boolean
      shuffle?: boolean
      /** @enum {string} */
      repeatMode?: 'off' | 'context' | 'track'
    }
    UpdateQueueDto: {
      trackIds: string[]
    }
    UpsertDeviceDto: {
      /** Format: uuid */
      id?: string
      name: string
      /** @enum {string} */
      type: 'web' | 'desktop' | 'mobile' | 'speaker' | 'other'
      isActive?: boolean
    }
    /** @enum {string} */
    ReleaseType: 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION'
    /** @enum {string} */
    ReleaseStatus: 'DRAFT' | 'READY' | 'SUBMITTED' | 'RELEASED' | 'REJECTED'
    ReleaseEntity: {
      /** Format: uuid */
      id: string
      title: string
      type: components['schemas']['ReleaseType']
      status: components['schemas']['ReleaseStatus']
      upc: string | null
      /** Format: date-time */
      scheduledAt: string | null
      /** Format: date-time */
      createdAt: string
      /** Format: date-time */
      updatedAt: string
    }
    /** @enum {string} */
    ReleaseBlockerCode:
      | 'NO_TRACKS'
      | 'MASTER_OWNER_MISSING'
      | 'WRITERS_NOT_CONFIRMED'
      | 'ACCURACY_NOT_CONFIRMED'
      | 'CONTRIBUTOR_ROLES_MISSING'
      | 'SPLITS_INCOMPLETE'
    /** @enum {string} */
    ReleaseRightType: 'RECORDING' | 'COMPOSITION'
    ReleaseBlockerEntity: {
      code: components['schemas']['ReleaseBlockerCode']
      /** Format: uuid */
      contributorId?: string
      rightType?: components['schemas']['ReleaseRightType']
      totalBasisPoints?: number
    }
    CreateReleaseDto: {
      title: string
      /**
       * @description Defaults to SINGLE when omitted
       * @enum {string}
       */
      type?: 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION'
    }
    /** @enum {string} */
    ArtistTrackVersion: 'ORIGINAL' | 'REMASTER' | 'LIVE' | 'DEMO'
    /** @enum {string} */
    ArtistTrackStatus:
      | 'DRAFT'
      | 'PROCESSING'
      | 'READY'
      | 'NEEDS_CHANGES'
      | 'PUBLISHED'
      | 'UPLOAD_FAILED'
    WorkspaceTrackDraftEntity: {
      /** Format: uuid */
      id: string
      title: string
      version: components['schemas']['ArtistTrackVersion']
      status: components['schemas']['ArtistTrackStatus']
      duration: number | null
      isDemo: boolean
      /** @example USRC17607839 */
      isrc: string | null
    }
    WorkspaceTrackEntity: {
      /** Format: uuid */
      id: string
      title: string
      duration: number | null
      position: number
      isrc: string | null
    }
    /** @enum {string} */
    ReleaseCreditRole: 'PERFORMER' | 'PRODUCER' | 'COMPOSER' | 'LYRICIST' | 'OTHER'
    WorkspaceParticipantEntity: {
      /** Format: uuid */
      id: string
      displayName: string
      roles: components['schemas']['ReleaseCreditRole'][]
    }
    /** @enum {string} */
    ReleaseMasterOwner: 'ARTIST' | 'OTHER'
    WorkspaceRightsEntity: {
      masterOwnerType: components['schemas']['ReleaseMasterOwner'] | null
      /** @description Set only for OTHER */
      masterOwnerName: string | null
      /** Format: date-time */
      writersConfirmedAt: string | null
      /** Format: date-time */
      accuracyConfirmedAt: string | null
    }
    WorkspaceSplitEntity: {
      /** Format: uuid */
      contributorId: string
      rightType: components['schemas']['ReleaseRightType']
      shareBasisPoints: number
    }
    /** @enum {string} */
    ReleaseNoticeCode: 'UPC_MISSING' | 'ISRC_MISSING'
    ReleaseNoticeEntity: {
      code: components['schemas']['ReleaseNoticeCode']
      /** Format: uuid */
      trackId?: string
    }
    ReleaseReadinessEntity: {
      /** @description Each blocks submission */
      blockers: components['schemas']['ReleaseBlockerEntity'][]
      /** @description Informational; never blocks */
      notices: components['schemas']['ReleaseNoticeEntity'][]
    }
    ReleaseWorkspaceEntity: {
      /** Format: uuid */
      id: string
      title: string
      type: components['schemas']['ReleaseType']
      status: components['schemas']['ReleaseStatus']
      upc: string | null
      /** Format: date-time */
      scheduledAt: string | null
      /** Format: date-time */
      createdAt: string
      /** Format: date-time */
      updatedAt: string
      artistName: string
      cover: string | null
      isDemo: boolean
      trackCount: number
      trackDrafts: components['schemas']['WorkspaceTrackDraftEntity'][]
      tracks: components['schemas']['WorkspaceTrackEntity'][]
      participants: components['schemas']['WorkspaceParticipantEntity'][]
      participantCount: number
      /** Format: date-time */
      submittedAt: string | null
      rights: components['schemas']['WorkspaceRightsEntity']
      splits: components['schemas']['WorkspaceSplitEntity'][]
      readiness: components['schemas']['ReleaseReadinessEntity']
    }
    UpdateReleaseDto: {
      title?: string
      /** @enum {string} */
      type?: 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION'
      /** @description Planned instant, ISO 8601 with milliseconds and timezone; null clears the plan. Does not submit delivery. */
      scheduledAt?: string | null
      /** @description Release barcode (UPC-A or EAN-13); null clears it. Optional for submission. */
      upc?: string | null
      /**
       * Format: date-time
       * @description Version read before editing
       */
      expectedUpdatedAt: string
    }
    AddReleaseContributorDto: {
      displayName: string
      roles: ('PERFORMER' | 'PRODUCER' | 'COMPOSER' | 'LYRICIST' | 'OTHER')[]
      /**
       * Format: date-time
       * @description Release version read before editing
       */
      expectedUpdatedAt: string
    }
    ReleaseContributorAddedEntity: {
      release: components['schemas']['ReleaseEntity']
      participant: components['schemas']['WorkspaceParticipantEntity']
    }
    ReleaseContributorEntity: {
      release: components['schemas']['ReleaseEntity']
      participant: components['schemas']['WorkspaceParticipantEntity']
    }
    UpdateReleaseContributorDto: {
      displayName: string
      roles: ('PERFORMER' | 'PRODUCER' | 'COMPOSER' | 'LYRICIST' | 'OTHER')[]
      /**
       * Format: date-time
       * @description Release version read before editing
       */
      expectedUpdatedAt: string
    }
    UpdateReleaseRightsDto: {
      /** @description null clears the master owner */
      masterOwner:
        | (
            | {
                /** @constant */
                type: 'ARTIST'
              }
            | {
                /** @constant */
                type: 'OTHER'
                name: string
              }
          )
        | null
      /** @description All songwriters and composers are credited */
      writersConfirmed: boolean
      /** @description The rights information is accurate */
      accuracyConfirmed: boolean
      /**
       * Format: date-time
       * @description Release version read before editing
       */
      expectedUpdatedAt: string
    }
    ReplaceReleaseSplitsDto: {
      /** @enum {string} */
      rightType: 'RECORDING' | 'COMPOSITION'
      shares: {
        /** Format: uuid */
        contributorId: string
        /** @description 1–10,000; 10,000 basis points is 100% */
        shareBasisPoints: number
      }[]
      /**
       * Format: date-time
       * @description Release version read before editing
       */
      expectedUpdatedAt: string
    }
    ReleaseShareEntity: {
      /** Format: uuid */
      contributorId: string
      /** @description 10,000 basis points is 100% */
      shareBasisPoints: number
    }
    ReleaseSplitsEntity: {
      release: components['schemas']['ReleaseEntity']
      rightType: components['schemas']['ReleaseRightType']
      shares: components['schemas']['ReleaseShareEntity'][]
    }
    UpdateReleaseTrackDto: {
      /** @description ISO 3901 code, with or without hyphens; stored without them. null clears it. Optional for submission. */
      isrc: string | null
      /**
       * Format: date-time
       * @description Release version read before editing
       */
      expectedUpdatedAt: string
    }
    ReleaseTrackIdentifierEntity: {
      /** Format: uuid */
      id: string
      /** @example USRC17607839 */
      isrc: string | null
    }
    ReleaseTrackUpdatedEntity: {
      release: components['schemas']['ReleaseEntity']
      track: components['schemas']['ReleaseTrackIdentifierEntity']
    }
    SubmitReleaseDto: {
      /**
       * @description The artist reviewed the information in this draft
       * @constant
       */
      reviewed: true
      /**
       * Format: date-time
       * @description Release version read before submitting
       */
      expectedUpdatedAt: string
    }
    WithdrawReleaseDto: {
      /**
       * Format: date-time
       * @description Release version read before submitting
       */
      expectedUpdatedAt: string
    }
    MusicTrackReleaseEntity: {
      /** Format: uuid */
      id: string
      title: string
    }
    MusicTrackEntity: {
      /** Format: uuid */
      id: string
      title: string
      artistName: string
      version: components['schemas']['ArtistTrackVersion']
      status: components['schemas']['ArtistTrackStatus']
      duration: number | null
      cover: string | null
      previewUrl: string | null
      isDemo: boolean
      /** Format: date-time */
      updatedAt: string
      release: components['schemas']['MusicTrackReleaseEntity'] | null
    }
    MusicReleaseEntity: {
      /** Format: uuid */
      id: string
      title: string
      type: components['schemas']['ReleaseType']
      status: components['schemas']['ReleaseStatus']
      upc: string | null
      /** Format: date-time */
      scheduledAt: string | null
      /** Format: date-time */
      createdAt: string
      /** Format: date-time */
      updatedAt: string
      artistName: string
      cover: string | null
      isDemo: boolean
      trackCount: number
    }
    MusicCountsEntity: {
      tracks: number
      releases: number
    }
    CreateReportDto: {
      /** @enum {string} */
      entityType: 'track' | 'album' | 'playlist' | 'artist' | 'podcast' | 'episode' | 'user'
      /** Format: uuid */
      entityId: string
      reason: string
      details?: string
    }
    StaffEntity: {
      /** @description The id value. */
      id: string
      /** @description The email value. */
      email: string
      /** @description The username value. */
      username: string
      /** @description The id of the role this operator was assigned — provenance/display only. */
      roleId: string
      /** @description The name of the role this operator was assigned. Grants nothing by itself — see `permissions`. */
      role: string
      /** @description The permissions actually held by this operator. */
      permissions: (
        | 'reports:read'
        | 'reports:advance'
        | 'reports:export'
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'artists:export'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'tracks:export'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'users:export'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
        | 'genres:read'
        | 'genres:write'
        | 'genres:delete'
        | 'albums:read'
        | 'albums:delete'
        | 'albums:restore'
        | 'playlists:read'
        | 'playlists:hide'
        | 'playlists:delete'
        | 'playlists:restore'
        | 'podcasts:read'
        | 'podcasts:delete'
        | 'podcasts:restore'
      )[]
      /** @description Whether two-factor authentication is enabled. */
      twoFactorEnabled: boolean
      /** @description Consecutive failed login attempts. */
      failedLoginAttempts: number
      /**
       * Format: date-time
       * @description Account lock expiration timestamp.
       */
      lockedUntil: string | null
      /**
       * Format: date-time
       * @description Soft-delete timestamp.
       */
      deletedAt: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
    }
    StaffSessionEntity: {
      /** @description The id value. */
      id: string
      /** @description The staff id value. */
      staffId: string
      /** @description The access token value. */
      access_token: string
      /** @description The refresh token value. */
      refresh_token: string
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The expires at value.
       */
      expiresAt: string
    }
    AdminLoginDto: {
      /**
       * @description Staff email
       * @example ops@bitrate.app
       */
      email: string
      /**
       * @description Staff password
       * @example password123
       */
      password: string
    }
    AdminModerationReportEntity: {
      /** @description The id value. */
      id: string
      /** @description The reporter id value. */
      reporterId: string
      /** @description The reported entity's type. */
      entityType: string
      /** @description The reported entity's id. */
      entityId: string
      /** @description The reason value. */
      reason: string
      /** @description The details value. */
      details?: string | null
      /**
       * @description The moderation status value.
       * @enum {string}
       */
      status: 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'REJECTED'
      /**
       * Format: date-time
       * @description When the report was resolved, if it was.
       */
      resolvedAt?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
    }
    PaginatedReportsEntity: {
      /** @description The reports on this page. */
      data: components['schemas']['AdminModerationReportEntity'][]
      /** @description The total number of reports matching the query. */
      total: number
      /** @description The current page number. */
      page: number
      /** @description The page size. */
      limit: number
    }
    BatchIdsDto: {
      ids: string[]
    }
    AdminBatchItemErrorEntity: {
      /**
       * @description Stable machine-readable code, derived from the HTTP status the single-entity route would answer.
       * @example NOT_FOUND
       */
      code: string
      /** @description Human-readable reason, the same message the single-entity route would return. */
      message: string
    }
    AdminBatchItemResultEntity: {
      /** Format: uuid */
      id: string
      /** @enum {string} */
      status: 'succeeded' | 'failed'
      /** @description Present only when `status` is `failed`. */
      error?: components['schemas']['AdminBatchItemErrorEntity']
    }
    AdminBatchResultEntity: {
      results: components['schemas']['AdminBatchItemResultEntity'][]
      /** @description Distinct ids processed. */
      total: number
      succeeded: number
      failed: number
    }
    ModerationSubjectEntity: {
      /**
       * @description The resolved entity kind — `track`, `album`, `playlist`, `artist`, `podcast`, `episode`,
       *     or `user`.
       */
      kind: string
      /** @description The subject's id. */
      id: string
      /** @description The subject's display title (or username, for a user/artist subject). */
      title: string
      /**
       * Format: date-time
       * @description The subject's soft-delete timestamp, if it has one and is deleted.
       */
      deletedAt?: string | null
      /**
       * @description The subject's owning parent, when its kind has one — an episode's podcast id. `null` for
       *     every other kind, kept as one field rather than a kind-specific one so the entity stays
       *     simple; a future parent-bearing kind reuses this instead of adding another optional field.
       */
      parentId?: string | null
    }
    AdminModerationReportDetailEntity: {
      /** @description The id value. */
      id: string
      /** @description The reporter id value. */
      reporterId: string
      /** @description The reported entity's type. */
      entityType: string
      /** @description The reported entity's id. */
      entityId: string
      /** @description The reason value. */
      reason: string
      /** @description The details value. */
      details?: string | null
      /**
       * @description The moderation status value.
       * @enum {string}
       */
      status: 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'REJECTED'
      /**
       * Format: date-time
       * @description When the report was resolved, if it was.
       */
      resolvedAt?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /**
       * @description The resolved reported entity, or `null` for an unrecognised type or a row that no longer
       *     exists. Always present in the response — `nullable`, not optional; a client can rely on
       *     the key existing and only needs to check the value.
       */
      subject: components['schemas']['ModerationSubjectEntity'] | null
      /** @description Other reports naming the same subject, newest first, bounded. */
      siblingReports: components['schemas']['AdminModerationReportEntity'][]
    }
    UpdateReportDto: {
      /** @enum {string} */
      status: 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'REJECTED'
    }
    AdminArtistEntity: {
      /** @description The id value. */
      id: string
      /** @description The username value. */
      username: string
      /** @description The email value. */
      email: string
      /** @description The artist bio. */
      bio?: string | null
      /** @description The avatar URL. */
      avatar?: string | null
      /** @description The profile background image URL. */
      backgroundImage?: string | null
      /** @description Whether the artist account is verified. */
      verified: boolean
      /** @description Recorded monthly listener count. */
      monthlyListeners: number
      /** @description The artist's declared country. */
      country?: string | null
      /** @description Whether two-factor authentication is enabled. */
      twoFactorEnabled: boolean
      /**
       * Format: date-time
       * @description Email verification timestamp.
       */
      emailVerifiedAt?: string | null
      /** @description Consecutive failed login attempts. */
      failedLoginAttempts: number
      /**
       * Format: date-time
       * @description Account lock expiration timestamp.
       */
      lockedUntil?: string | null
      /**
       * Format: date-time
       * @description Soft-delete timestamp.
       */
      deletedAt?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
    }
    PaginatedAdminArtistsEntity: {
      /** @description The artists on this page. */
      data: components['schemas']['AdminArtistEntity'][]
      /** @description The total number of artists matching the query. */
      total: number
      /** @description The current page number. */
      page: number
      /** @description The page size. */
      limit: number
    }
    AdminArtistCountsEntity: {
      /** @description How many non-deleted tracks the artist is the primary artist on. */
      tracks: number
      /** @description How many non-deleted albums the artist owns. */
      albums: number
      /** @description How many of the artist's sessions have not yet expired. */
      activeSessions: number
      /** @description How many `OPEN` moderation reports name this artist. */
      openReports: number
    }
    AdminArtistDetailEntity: {
      /** @description The id value. */
      id: string
      /** @description The username value. */
      username: string
      /** @description The email value. */
      email: string
      /** @description The artist bio. */
      bio?: string | null
      /** @description The avatar URL. */
      avatar?: string | null
      /** @description The profile background image URL. */
      backgroundImage?: string | null
      /** @description Whether the artist account is verified. */
      verified: boolean
      /** @description Recorded monthly listener count. */
      monthlyListeners: number
      /** @description The artist's declared country. */
      country?: string | null
      /** @description Whether two-factor authentication is enabled. */
      twoFactorEnabled: boolean
      /**
       * Format: date-time
       * @description Email verification timestamp.
       */
      emailVerifiedAt?: string | null
      /** @description Consecutive failed login attempts. */
      failedLoginAttempts: number
      /**
       * Format: date-time
       * @description Account lock expiration timestamp.
       */
      lockedUntil?: string | null
      /**
       * Format: date-time
       * @description Soft-delete timestamp.
       */
      deletedAt?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /** @description Activity counts for this artist. */
      counts: components['schemas']['AdminArtistCountsEntity']
    }
    AdminArtistTrackEntity: {
      /** @description The id value. */
      id: string
      /** @description The title value. */
      title: string
      /**
       * @description The stored cover image's filename, or `null`. See `AdminTrackEntity.cover` for the URL
       *     convention this follows.
       */
      cover?: string | null
      /**
       * @description The processing status value.
       * @enum {string}
       */
      processingStatus: 'PROCESSING' | 'READY' | 'FAILED'
      /** @description Total play count. */
      playCount: number
      /**
       * Format: date-time
       * @description Soft-delete (take-down) timestamp.
       */
      deletedAt?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
    }
    PaginatedAdminArtistTracksEntity: {
      /** @description The tracks on this page. */
      data: components['schemas']['AdminArtistTrackEntity'][]
      /** @description The total number of tracks matching the query. */
      total: number
      /** @description The current page number. */
      page: number
      /** @description The page size. */
      limit: number
    }
    AdminArtistAlbumEntity: {
      /** @description The id value. */
      id: string
      /** @description The title value. */
      title: string
      /** @description The stored cover image's filename, or `null`. */
      cover?: string | null
      /**
       * @description The album type value.
       * @enum {string}
       */
      type: 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION'
      /** @description How many tracks the album lists. */
      totalTracks: number
      /**
       * Format: date-time
       * @description Release date, or `null` if unset.
       */
      releaseDate?: string | null
      /**
       * Format: date-time
       * @description Soft-delete (take-down) timestamp.
       */
      deletedAt?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
    }
    PaginatedAdminArtistAlbumsEntity: {
      /** @description The albums on this page. */
      data: components['schemas']['AdminArtistAlbumEntity'][]
      /** @description The total number of albums matching the query. */
      total: number
      /** @description The current page number. */
      page: number
      /** @description The page size. */
      limit: number
    }
    UpdateArtistVerificationDto: {
      verified: boolean
    }
    TakeDownReasonDto: {
      reason?: string
    }
    AdminRevokeSessionsResultEntity: {
      /** @description How many sessions were deleted. */
      revoked: number
    }
    AdminUserEntity: {
      /** @description The id value. */
      id: string
      /** @description The username value. */
      username: string
      /** @description The email value. */
      email: string
      /** @description The avatar URL. */
      avatar?: string | null
      /** @description The profile description. */
      description?: string | null
      /** @description Whether two-factor authentication is enabled. */
      twoFactorEnabled: boolean
      /**
       * Format: date-time
       * @description Email verification timestamp.
       */
      emailVerifiedAt?: string | null
      /** @description Consecutive failed login attempts. */
      failedLoginAttempts: number
      /**
       * Format: date-time
       * @description Account lock expiration timestamp.
       */
      lockedUntil?: string | null
      /**
       * Format: date-time
       * @description Soft-delete timestamp.
       */
      deletedAt?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
    }
    PaginatedAdminUsersEntity: {
      /** @description The users on this page. */
      data: components['schemas']['AdminUserEntity'][]
      /** @description The total number of users matching the query. */
      total: number
      /** @description The current page number. */
      page: number
      /** @description The page size. */
      limit: number
    }
    AdminUserCountsEntity: {
      /** @description How many playlists the user owns. */
      playlists: number
      /** @description How many tracks the user has liked. */
      likedTracks: number
      /** @description How many listening-history rows the user has. */
      listeningHistory: number
      /** @description How many moderation reports the user has filed. */
      reportsFiled: number
      /** @description How many of the user's sessions have not yet expired. */
      activeSessions: number
    }
    AdminUserDetailEntity: {
      /** @description The id value. */
      id: string
      /** @description The username value. */
      username: string
      /** @description The email value. */
      email: string
      /** @description The avatar URL. */
      avatar?: string | null
      /** @description The profile description. */
      description?: string | null
      /** @description Whether two-factor authentication is enabled. */
      twoFactorEnabled: boolean
      /**
       * Format: date-time
       * @description Email verification timestamp.
       */
      emailVerifiedAt?: string | null
      /** @description Consecutive failed login attempts. */
      failedLoginAttempts: number
      /**
       * Format: date-time
       * @description Account lock expiration timestamp.
       */
      lockedUntil?: string | null
      /**
       * Format: date-time
       * @description Soft-delete timestamp.
       */
      deletedAt?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /** @description Activity counts for this user. */
      counts: components['schemas']['AdminUserCountsEntity']
    }
    AdminListeningHistoryEntryEntity: {
      /** @description The listening-history row's id. */
      id: string
      /**
       * Format: date-time
       * @description When the listen was recorded.
       */
      listenedAt: string
      /** @description The listened track's id. */
      trackId: string
      /** @description The listened track's title. */
      trackTitle: string
      /** @description The track's primary artist username. */
      artistUsername: string
    }
    PaginatedAdminListeningHistoryEntity: {
      /** @description The listening-history rows on this page. */
      data: components['schemas']['AdminListeningHistoryEntryEntity'][]
      /** @description The total number of listening-history rows for this user. */
      total: number
      /** @description The current page number. */
      page: number
      /** @description The page size. */
      limit: number
    }
    AdminTrackEntity: {
      /** @description The id value. */
      id: string
      /** @description The title value. */
      title: string
      /** @description The primary artist's id. */
      artistId: string
      /** @description The primary artist's display name — avoids an N+1 lookup on the operator screen. */
      artistUsername: string
      /**
       * @description The stored cover image's filename (a storage key, not a URL) — e.g. `"abc123.png"`. Public
       *     covers are stored under `tracks/covers/` and served by the API at
       *     `/static/tracks/covers/<cover>`; a consumer must build that URL itself. `null` when the
       *     track has no cover.
       */
      cover?: string | null
      /**
       * @description The processing status value.
       * @enum {string}
       */
      processingStatus: 'PROCESSING' | 'READY' | 'FAILED'
      /** @description The last recorded processing error, if any. */
      processingError?: string | null
      /** @description How many processing attempts have been made. */
      processingAttempts: number
      /**
       * Format: date-time
       * @description When the current/most-recent processing attempt started.
       */
      processingStartedAt?: string | null
      /**
       * Format: date-time
       * @description When processing last finished (success or failure).
       */
      processingFinishedAt?: string | null
      /**
       * Format: date-time
       * @description Soft-delete timestamp.
       */
      deletedAt?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
    }
    PaginatedAdminTracksEntity: {
      /** @description The tracks on this page. */
      data: components['schemas']['AdminTrackEntity'][]
      /** @description The total number of tracks matching the query. */
      total: number
      /** @description The current page number. */
      page: number
      /** @description The page size. */
      limit: number
    }
    AdminTrackFileEntity: {
      /** @description The id value. */
      id: string
      /** @description The container/encoding format — e.g. `opus`, `mp3`, `cmaf`. */
      format: string
      /** @description The bitrate in kbps. */
      bitrate: number
      /** @description The audio codec, if recorded. */
      codec?: string | null
      /** @description The file size in bytes, if recorded. */
      size?: number | null
    }
    AdminTrackArtistCreditEntity: {
      /** @description The credited artist's id. */
      artistId: string
      /** @description The credited artist's display name. */
      username: string
      /** @description Whether this credit is the track's primary artist. */
      isPrimary: boolean
      /** @description The credit's display position among the track's artists. */
      position: number
    }
    AdminTrackGenreEntity: {
      /** @description The id value. */
      id: string
      /** @description The name value. */
      name: string
      /** @description The slug value. */
      slug: string
    }
    AdminTrackAlbumEntity: {
      /** @description The id value. */
      id: string
      /** @description The title value. */
      title: string
      /** @description The track's number within its disc on this album. */
      trackNumber: number
      /** @description The disc number within this album. */
      discNumber: number
    }
    AdminTrackDetailEntity: {
      /** @description The id value. */
      id: string
      /** @description The title value. */
      title: string
      /** @description The primary artist's id. */
      artistId: string
      /** @description The primary artist's display name — avoids an N+1 lookup on the operator screen. */
      artistUsername: string
      /**
       * @description The stored cover image's filename (a storage key, not a URL) — e.g. `"abc123.png"`. Public
       *     covers are stored under `tracks/covers/` and served by the API at
       *     `/static/tracks/covers/<cover>`; a consumer must build that URL itself. `null` when the
       *     track has no cover.
       */
      cover?: string | null
      /**
       * @description The processing status value.
       * @enum {string}
       */
      processingStatus: 'PROCESSING' | 'READY' | 'FAILED'
      /** @description The last recorded processing error, if any. */
      processingError?: string | null
      /** @description How many processing attempts have been made. */
      processingAttempts: number
      /**
       * Format: date-time
       * @description When the current/most-recent processing attempt started.
       */
      processingStartedAt?: string | null
      /**
       * Format: date-time
       * @description When processing last finished (success or failure).
       */
      processingFinishedAt?: string | null
      /**
       * Format: date-time
       * @description Soft-delete timestamp.
       */
      deletedAt?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /** @description The stored audio renditions. */
      audioFiles: components['schemas']['AdminTrackFileEntity'][]
      /** @description The credited artists. */
      artists: components['schemas']['AdminTrackArtistCreditEntity'][]
      /** @description The attached genres. */
      genres: components['schemas']['AdminTrackGenreEntity'][]
      /** @description The albums this track appears on. */
      albums: components['schemas']['AdminTrackAlbumEntity'][]
      /** @description How many `OPEN` moderation reports name this track. */
      openReportCount: number
    }
    /**
     * @description What triggered this generation's processing.
     * @enum {string}
     */
    TrackProcessingTrigger: 'UPLOAD' | 'REPLACE' | 'REPROCESS'
    /**
     * @description The outcome of this attempt.
     * @enum {string}
     */
    TrackProcessingAttemptStatus: 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'SUPERSEDED' | 'STALLED'
    /**
     * @description The pipeline step that failed, if any.
     * @enum {string}
     */
    TrackProcessingStep:
      | 'CLAIM'
      | 'PREPARE_TEMP'
      | 'PROGRESSIVE_ENCODE'
      | 'HLS_ENCODE'
      | 'HLS_VALIDATE'
      | 'CMAF_ENCODE'
      | 'UPLOAD'
      | 'PUBLISH'
      | 'CLEANUP'
    /**
     * @description The classified error code, if this attempt failed.
     * @enum {string}
     */
    TrackProcessingErrorCode:
      | 'FFMPEG_EXIT'
      | 'FFMPEG_SIGNAL'
      | 'TIMEOUT'
      | 'INVALID_INPUT'
      | 'EMPTY_OUTPUT'
      | 'STORAGE'
      | 'DATABASE'
      | 'STALLED'
      | 'UNKNOWN'
    AdminTrackProcessingAttemptEntity: {
      /** @description The id value. */
      id: string
      /** @description The owning track's id. */
      trackId: string
      /** @description The generation of the source file this attempt encoded. */
      sourceFileName: string
      /** @description The BullMQ job id. */
      jobId: string
      /** @description 1-based attempt number for this job. */
      attempt: number
      /** @description The maximum number of attempts BullMQ will make for this job. */
      maxAttempts: number
      /** @description What triggered this generation's processing. */
      trigger: components['schemas']['TrackProcessingTrigger']
      /** @description The outcome of this attempt. */
      status: components['schemas']['TrackProcessingAttemptStatus']
      /** @description Whether this attempt failed and BullMQ will retry it. */
      willRetry: boolean
      /** @description The dead-letter queue job id, set on the exhausted attempt. */
      deadLetterJobId?: string | null
      /**
       * Format: date-time
       * @description When this attempt started.
       */
      startedAt: string
      /**
       * Format: date-time
       * @description When this attempt finished, if it has.
       */
      finishedAt?: string | null
      /** @description How long this attempt ran, in milliseconds. */
      durationMs?: number | null
      /** @description The last progress percentage reported. */
      lastProgress: number
      /** @description The pipeline step that failed, if any. */
      failedStep?: components['schemas']['TrackProcessingStep'] | null
      /** @description Extra detail about the failed step, e.g. the bitrate being encoded. */
      stepDetail?: string | null
      /** @description The classified error code, if this attempt failed. */
      errorCode?: components['schemas']['TrackProcessingErrorCode'] | null
      /** @description The error's constructor name. */
      errorName?: string | null
      /** @description The redacted error message. */
      errorMessage?: string | null
      /** @description The redacted error stack trace. */
      errorStack?: string | null
      /** @description Whether the error is believed to be transient. Advisory — see ADR-0040. */
      retryable?: boolean | null
      /** @description The redacted FFmpeg command line, if this attempt ran one. */
      commandSummary?: string | null
      /** @description The redacted tail of FFmpeg's stderr output. */
      stderrTail?: string | null
      /** @description The FFmpeg process exit code, if it exited non-zero. */
      exitCode?: number | null
      /** @description The signal that killed the FFmpeg process, if any. */
      signal?: string | null
      /** @description The input file's size in bytes. */
      inputBytes?: number | null
      /** @description The input file's audio codec. */
      inputCodec?: string | null
      /** @description The input file's container format. */
      inputContainer?: string | null
      /** @description The input file's bitrate in kbps. */
      inputBitrateKbps?: number | null
      /** @description The input file's duration in seconds. */
      inputDurationSec?: number | null
      /** @description The hostname of the worker that ran this attempt. */
      workerHost: string
      /** @description The process id of the worker that ran this attempt. */
      workerPid: number
      /** @description The worker's release identifier, null outside production. */
      workerRelease?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
    }
    PaginatedAdminTrackProcessingAttemptsEntity: {
      /** @description The attempts on this page, newest first. */
      data: components['schemas']['AdminTrackProcessingAttemptEntity'][]
      /** @description The total number of attempts recorded for this track. */
      total: number
      /** @description The current page number. */
      page: number
      /** @description The page size. */
      limit: number
    }
    AdminAuditLogEntity: {
      /** @description The id value. */
      id: string
      /** @description The audited action, e.g. `admin-artists.updateVerification`. */
      action: string
      /** @description The controller-derived entity type the action targeted. */
      entityType: string
      /** @description The id of the entity the action targeted, if resolvable from the route. */
      entityId?: string | null
      /** @description The raw user id of the actor, if the actor was an end user. */
      userId?: string | null
      /** @description The raw staff id of the actor, if the actor was a staff operator. */
      staffId?: string | null
      /**
       * @description The actor's display username — resolved server-side so the operator screen
       *     never has to N+1 a lookup per row. `null` when the actor could not be
       *     resolved (e.g. the account was later deleted).
       */
      actorUsername?: string | null
      /** @description Freeform metadata captured at audit time. */
      metadata?: Record<string, never> | null
      /** @description The originating request's IP address, if recorded. */
      ipAddress?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
    }
    PaginatedAdminAuditLogsEntity: {
      /** @description The audit log rows on this page. */
      data: components['schemas']['AdminAuditLogEntity'][]
      /** @description The total number of rows matching the query. */
      total: number
      /** @description The current page number. */
      page: number
      /** @description The page size. */
      limit: number
    }
    RoleEntity: {
      /** @description The id value. */
      id: string
      /** @description The name value. */
      name: string
      /** @description The description value. */
      description?: string | null
      /** @description Whether this is a built-in role (`ADMIN` or `MODERATOR`). */
      builtIn: boolean
      /** @description The permissions this template grants when assigned. */
      permissions: (
        | 'reports:read'
        | 'reports:advance'
        | 'reports:export'
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'artists:export'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'tracks:export'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'users:export'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
        | 'genres:read'
        | 'genres:write'
        | 'genres:delete'
        | 'albums:read'
        | 'albums:delete'
        | 'albums:restore'
        | 'playlists:read'
        | 'playlists:hide'
        | 'playlists:delete'
        | 'playlists:restore'
        | 'podcasts:read'
        | 'podcasts:delete'
        | 'podcasts:restore'
      )[]
      /** @description Active operators currently assigned this role. */
      holders: number
      /** @description Active holders whose own permission set no longer matches this template. */
      divergentHolders: number
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
    }
    RolePermissionEntity: {
      /**
       * @description The permission id.
       * @enum {string}
       */
      id:
        | 'reports:read'
        | 'reports:advance'
        | 'reports:export'
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'artists:export'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'tracks:export'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'users:export'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
        | 'genres:read'
        | 'genres:write'
        | 'genres:delete'
        | 'albums:read'
        | 'albums:delete'
        | 'albums:restore'
        | 'playlists:read'
        | 'playlists:hide'
        | 'playlists:delete'
        | 'playlists:restore'
        | 'podcasts:read'
        | 'podcasts:delete'
        | 'podcasts:restore'
      /**
       * @description Active, non-`ADMIN` operators currently holding this permission. Zero means only the
       *     built-in `ADMIN` role can exercise it today.
       */
      heldBy: number
      /** @description Whether this permission is grantable only to the built-in `ADMIN` role by identity. */
      protected: boolean
    }
    CreateRoleDto: {
      name: string
      description?: string
      /** @default [] */
      permissions: (
        | 'reports:read'
        | 'reports:advance'
        | 'reports:export'
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'artists:export'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'tracks:export'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'users:export'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
        | 'genres:read'
        | 'genres:write'
        | 'genres:delete'
        | 'albums:read'
        | 'albums:delete'
        | 'albums:restore'
        | 'playlists:read'
        | 'playlists:hide'
        | 'playlists:delete'
        | 'playlists:restore'
        | 'podcasts:read'
        | 'podcasts:delete'
        | 'podcasts:restore'
      )[]
    }
    UpdateRoleDto: {
      name?: string
      description?: string | null
      permissions?: (
        | 'reports:read'
        | 'reports:advance'
        | 'reports:export'
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'artists:export'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'tracks:export'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'users:export'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
        | 'genres:read'
        | 'genres:write'
        | 'genres:delete'
        | 'albums:read'
        | 'albums:delete'
        | 'albums:restore'
        | 'playlists:read'
        | 'playlists:hide'
        | 'playlists:delete'
        | 'playlists:restore'
        | 'podcasts:read'
        | 'podcasts:delete'
        | 'podcasts:restore'
      )[]
    }
    AdminStaffRoleEntity: {
      /** @description The id value. */
      id: string
      /** @description The name value. */
      name: string
      /** @description The role's current template — may differ from the operator's own `permissions`. */
      permissions: (
        | 'reports:read'
        | 'reports:advance'
        | 'reports:export'
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'artists:export'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'tracks:export'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'users:export'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
        | 'genres:read'
        | 'genres:write'
        | 'genres:delete'
        | 'albums:read'
        | 'albums:delete'
        | 'albums:restore'
        | 'playlists:read'
        | 'playlists:hide'
        | 'playlists:delete'
        | 'playlists:restore'
        | 'podcasts:read'
        | 'podcasts:delete'
        | 'podcasts:restore'
      )[]
    }
    AdminStaffEntity: {
      /** @description The id value. */
      id: string
      /** @description The email value. */
      email: string
      /** @description The username value. */
      username: string
      /**
       * @description The role this operator is assigned, embedded so the panel can compute divergence from
       *     `permissions` without an extra request.
       */
      role: components['schemas']['AdminStaffRoleEntity']
      /** @description The permissions actually held by this operator. */
      permissions: (
        | 'reports:read'
        | 'reports:advance'
        | 'reports:export'
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'artists:export'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'tracks:export'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'users:export'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
        | 'genres:read'
        | 'genres:write'
        | 'genres:delete'
        | 'albums:read'
        | 'albums:delete'
        | 'albums:restore'
        | 'playlists:read'
        | 'playlists:hide'
        | 'playlists:delete'
        | 'playlists:restore'
        | 'podcasts:read'
        | 'podcasts:delete'
        | 'podcasts:restore'
      )[]
      /** @description Whether two-factor authentication is enabled. */
      twoFactorEnabled: boolean
      /** @description Consecutive failed login attempts. */
      failedLoginAttempts: number
      /**
       * Format: date-time
       * @description Account lock expiration timestamp.
       */
      lockedUntil?: string | null
      /**
       * Format: date-time
       * @description Soft-delete (deactivation) timestamp.
       */
      deletedAt?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
    }
    PaginatedAdminStaffEntity: {
      /** @description The operators on this page. */
      data: components['schemas']['AdminStaffEntity'][]
      /** @description The total number of operators matching the query. */
      total: number
      /** @description The current page number. */
      page: number
      /** @description The page size. */
      limit: number
    }
    CreateStaffDto: {
      /** Format: email */
      email: string
      username: string
      password: string
      /** Format: uuid */
      roleId: string
      permissions?: (
        | 'reports:read'
        | 'reports:advance'
        | 'reports:export'
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'artists:export'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'tracks:export'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'users:export'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
        | 'genres:read'
        | 'genres:write'
        | 'genres:delete'
        | 'albums:read'
        | 'albums:delete'
        | 'albums:restore'
        | 'playlists:read'
        | 'playlists:hide'
        | 'playlists:delete'
        | 'playlists:restore'
        | 'podcasts:read'
        | 'podcasts:delete'
        | 'podcasts:restore'
      )[]
    }
    AssignStaffRoleDto: {
      /** Format: uuid */
      roleId: string
      permissions?: (
        | 'reports:read'
        | 'reports:advance'
        | 'reports:export'
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'artists:export'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'tracks:export'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'users:export'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
        | 'genres:read'
        | 'genres:write'
        | 'genres:delete'
        | 'albums:read'
        | 'albums:delete'
        | 'albums:restore'
        | 'playlists:read'
        | 'playlists:hide'
        | 'playlists:delete'
        | 'playlists:restore'
        | 'podcasts:read'
        | 'podcasts:delete'
        | 'podcasts:restore'
      )[]
    }
    UpdateStaffPermissionsDto: {
      permissions: (
        | 'reports:read'
        | 'reports:advance'
        | 'reports:export'
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'artists:export'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'tracks:export'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'users:export'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
        | 'genres:read'
        | 'genres:write'
        | 'genres:delete'
        | 'albums:read'
        | 'albums:delete'
        | 'albums:restore'
        | 'playlists:read'
        | 'playlists:hide'
        | 'playlists:delete'
        | 'playlists:restore'
        | 'podcasts:read'
        | 'podcasts:delete'
        | 'podcasts:restore'
      )[]
    }
    AdminOverviewReportsEntity: {
      /** @description Reports awaiting a first look. */
      open: number
      /** @description Reports a moderator has already picked up. */
      reviewing: number
    }
    AdminOverviewTracksEntity: {
      /** @description Tracks still transcoding. */
      processing: number
      /** @description Tracks that finished transcoding successfully. */
      ready: number
      /** @description Tracks whose transcode failed. */
      failed: number
      /** @description `PROCESSING` tracks whose `processingStartedAt` is older than {@link stuckAfterMs}. */
      stuck: number
      /**
       * @description The cut, in milliseconds, after which a `PROCESSING` track counts as stuck — exposed so
       *     the panel never has to duplicate this threshold as its own constant.
       */
      stuckAfterMs: number
    }
    AdminOverviewDeactivatedEntity: {
      /** @description Deactivated listener accounts. */
      users: number
      /** @description Deactivated artist accounts. */
      artists: number
    }
    AdminOverviewLast7DaysEntity: {
      /** @description New listener + artist accounts created in the window, including ones later deactivated. */
      signups: number
      /** @description New tracks uploaded in the window, including ones later soft-deleted. */
      uploads: number
    }
    AdminOverviewEntity: {
      /** @description Moderation report counts. */
      reports: components['schemas']['AdminOverviewReportsEntity']
      /** @description Track pipeline counts. */
      tracks: components['schemas']['AdminOverviewTracksEntity']
      /** @description Deactivated account counts. */
      deactivated: components['schemas']['AdminOverviewDeactivatedEntity']
      /** @description Trailing-7-day activity counts. */
      last7Days: components['schemas']['AdminOverviewLast7DaysEntity']
      /** @description The 10 most recent operator actions, actor resolved. */
      recentActivity: components['schemas']['AdminAuditLogEntity'][]
    }
    AdminOverviewUploadsPointEntity: {
      /** @description The UTC calendar day this point covers, as `YYYY-MM-DD`. */
      date: string
      /** @description Tracks created on this day. */
      uploaded: number
      /** @description Of those, how many are currently `READY`. */
      ready: number
      /** @description Of those, how many are currently `FAILED`. */
      failed: number
      /**
       * @description Of those, how many are currently `PROCESSING` and past the stuck cut (see
       *     `AdminOverviewTracksEntity.stuckAfterMs`) — evaluated at query time, not at end of day.
       */
      stuck: number
    }
    AdminOverviewSignupsPointEntity: {
      /** @description The UTC calendar day this point covers, as `YYYY-MM-DD`. */
      date: string
      /** @description New listener accounts created on this day. */
      listeners: number
      /** @description New artist accounts created on this day. */
      artists: number
    }
    AdminOverviewListensPointEntity: {
      /** @description The UTC calendar day this point covers, as `YYYY-MM-DD`. */
      date: string
      /** @description Listening-history rows recorded on this day. */
      count: number
    }
    AdminOverviewReportsPointEntity: {
      /** @description The UTC calendar day this point covers, as `YYYY-MM-DD`. */
      date: string
      /** @description Reports filed on this day. */
      count: number
    }
    AdminOverviewReportsByStatusEntity: {
      /** @description Reports awaiting a first look. */
      open: number
      /** @description Reports a moderator has picked up. */
      reviewing: number
      /** @description Reports closed with action taken. */
      resolved: number
      /** @description Reports closed with no action taken. */
      rejected: number
    }
    AdminOverviewSeriesEntity: {
      /** @description The oldest day in the window, inclusive, as `YYYY-MM-DD`. */
      from: string
      /** @description The newest (today, UTC) day in the window, inclusive, as `YYYY-MM-DD`. */
      to: string
      /**
       * @description How many calendar days the window covers — `uploads`/`signups`/`listens`/`reports` each
       *     have exactly this many entries.
       */
      days: number
      /** @description Daily uploads, by processing outcome. */
      uploads: components['schemas']['AdminOverviewUploadsPointEntity'][]
      /** @description Daily new accounts, by account type. */
      signups: components['schemas']['AdminOverviewSignupsPointEntity'][]
      /** @description Daily listens, across every user. */
      listens: components['schemas']['AdminOverviewListensPointEntity'][]
      /** @description Daily newly filed moderation reports. */
      reports: components['schemas']['AdminOverviewReportsPointEntity'][]
      /** @description The current (not windowed) distribution of every report across its statuses. */
      reportsByStatus: components['schemas']['AdminOverviewReportsByStatusEntity']
    }
    AdminOverviewReportsByTypeSeriesEntity: {
      /**
       * @description The kind of entity the reports were filed against.
       * @enum {string}
       */
      entityType: 'track' | 'album' | 'playlist' | 'artist' | 'podcast' | 'episode' | 'user'
      /** @description Reports filed per day, aligned by index to the response's `dates`. */
      counts: number[]
      /** @description The sum of `counts` — reports of this entity type filed in the window. */
      total: number
    }
    AdminOverviewReportsByTypeEntity: {
      /** @description The oldest day in the window, inclusive, as `YYYY-MM-DD`. */
      from: string
      /** @description The newest (today, UTC) day in the window, inclusive, as `YYYY-MM-DD`. */
      to: string
      /** @description How many calendar days the window covers — equal to `dates.length`. */
      days: number
      /** @description Every UTC day in the window, oldest first, as `YYYY-MM-DD`. */
      dates: string[]
      /** @description One series per moderation entity type, in `MODERATION_ENTITY_TYPES` order. */
      series: components['schemas']['AdminOverviewReportsByTypeSeriesEntity'][]
      /** @description Reports filed in the window, across every entity type. */
      total: number
    }
    AdminGenreCountsEntity: {
      /** @description Tracks tagged with the genre. */
      tracks: number
      /** @description Albums tagged with the genre. */
      albums: number
      /** @description Artists tagged with the genre. */
      artists: number
    }
    AdminGenreEntity: {
      /** @description The id value. */
      id: string
      /** @description The URL slug, unique across genres. */
      slug: string
      /** @description The display name, unique across genres. */
      name: string
      /** @description The description. */
      description?: string | null
      /** @description The `#rrggbb` colour. */
      color?: string | null
      /** @description The cover image URL. */
      cover?: string | null
      /** @description What references this genre; delete is refused while any is above zero. */
      counts: components['schemas']['AdminGenreCountsEntity']
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
    }
    PaginatedAdminGenresEntity: {
      /** @description The genres on this page. */
      data: components['schemas']['AdminGenreEntity'][]
      /** @description The total number of genres matching the query. */
      total: number
      /** @description The current page number. */
      page: number
      /** @description The page size. */
      limit: number
    }
    CreateGenreDto: {
      name: string
      slug?: string
      description?: string | null
      color?: string | null
    }
    UpdateGenreDto: {
      name?: string
      slug?: string
      description?: string | null
      color?: string | null
    }
    AdminAlbumEntity: {
      /** @description The id value. */
      id: string
      /** @description The title value. */
      title: string
      /** @description The stored cover image's filename (a storage key, not a URL), or `null`. */
      cover?: string | null
      /** @description The owning artist's id. */
      artistId: string
      /** @description The owning artist's display name — avoids an N+1 lookup on the operator screen. */
      artistUsername: string
      /**
       * @description The album type value.
       * @enum {string}
       */
      type: 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION'
      /** @description How many tracks the album lists. */
      totalTracks: number
      /**
       * Format: date-time
       * @description Release date, or `null` if unset.
       */
      releaseDate?: string | null
      /**
       * Format: date-time
       * @description Soft-delete (take-down) timestamp.
       */
      deletedAt?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
    }
    PaginatedAdminAlbumsEntity: {
      /** @description The albums on this page. */
      data: components['schemas']['AdminAlbumEntity'][]
      /** @description The total number of albums matching the query. */
      total: number
      /** @description The current page number. */
      page: number
      /** @description The page size. */
      limit: number
    }
    AdminAlbumTrackEntity: {
      /** @description The track's id. */
      id: string
      /** @description The track's title. */
      title: string
      /** @description The track's number within its disc. */
      trackNumber: number
      /** @description The disc number. */
      discNumber: number
      /**
       * @description The track's audio processing status.
       * @enum {string}
       */
      processingStatus: 'PROCESSING' | 'READY' | 'FAILED'
      /**
       * Format: date-time
       * @description The track's own soft-delete timestamp — independent of the album's.
       */
      deletedAt?: string | null
    }
    AdminAlbumDetailEntity: {
      /** @description The id value. */
      id: string
      /** @description The title value. */
      title: string
      /** @description The stored cover image's filename (a storage key, not a URL), or `null`. */
      cover?: string | null
      /** @description The owning artist's id. */
      artistId: string
      /** @description The owning artist's display name — avoids an N+1 lookup on the operator screen. */
      artistUsername: string
      /**
       * @description The album type value.
       * @enum {string}
       */
      type: 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION'
      /** @description How many tracks the album lists. */
      totalTracks: number
      /**
       * Format: date-time
       * @description Release date, or `null` if unset.
       */
      releaseDate?: string | null
      /**
       * Format: date-time
       * @description Soft-delete (take-down) timestamp.
       */
      deletedAt?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /** @description The album description, if any. */
      description?: string | null
      /** @description The record label, if any. */
      label?: string | null
      /** @description The copyright line, if any. */
      copyright?: string | null
      /** @description The album's tracks, ordered by disc then track number. */
      tracks: components['schemas']['AdminAlbumTrackEntity'][]
    }
    AdminPlaylistEntity: {
      /** @description The id value. */
      id: string
      /** @description The title value. */
      title: string
      /** @description The stored cover image's filename (a storage key, not a URL), or `null`. */
      cover?: string | null
      /** @description The owning user's id. */
      ownerId: string
      /** @description The owning user's username — avoids an N+1 lookup on the operator screen. */
      ownerUsername: string
      /** @description Whether the playlist is public. An operator hide forces this to `false`. */
      isPublic: boolean
      /** @description How many users follow the playlist. */
      followersCount: number
      /** @description How many tracks the playlist holds. */
      trackCount: number
      /**
       * Format: date-time
       * @description Soft-delete (take-down) timestamp, independent of `isPublic`.
       */
      deletedAt?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
    }
    PaginatedAdminPlaylistsEntity: {
      /** @description The playlists on this page. */
      data: components['schemas']['AdminPlaylistEntity'][]
      /** @description The total number of playlists matching the query. */
      total: number
      /** @description The current page number. */
      page: number
      /** @description The page size. */
      limit: number
    }
    AdminPlaylistTrackEntity: {
      /** @description The track's id. */
      id: string
      /** @description The track's title. */
      title: string
      /** @description The track's position in the playlist, zero-based. */
      position: number
    }
    AdminPlaylistDetailEntity: {
      /** @description The id value. */
      id: string
      /** @description The title value. */
      title: string
      /** @description The stored cover image's filename (a storage key, not a URL), or `null`. */
      cover?: string | null
      /** @description The owning user's id. */
      ownerId: string
      /** @description The owning user's username — avoids an N+1 lookup on the operator screen. */
      ownerUsername: string
      /** @description Whether the playlist is public. An operator hide forces this to `false`. */
      isPublic: boolean
      /** @description How many users follow the playlist. */
      followersCount: number
      /** @description How many tracks the playlist holds. */
      trackCount: number
      /**
       * Format: date-time
       * @description Soft-delete (take-down) timestamp, independent of `isPublic`.
       */
      deletedAt?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /** @description The playlist description, if any. */
      description?: string | null
      /** @description Whether other users may add tracks. */
      collaborative: boolean
      /** @description The first 50 tracks in playlist order; `trackCount` holds the full total. */
      tracks: components['schemas']['AdminPlaylistTrackEntity'][]
    }
    SetPlaylistVisibilityDto: {
      reason?: string
      isPublic: boolean
    }
    AdminPodcastEntity: {
      /** @description The id value. */
      id: string
      /** @description The title value. */
      title: string
      /** @description The publisher's display name. */
      publisher: string
      /** @description The stored cover image reference, or `null`. */
      cover?: string | null
      /** @description The podcast's language code, if any. */
      language?: string | null
      /** @description Whether the podcast is flagged explicit. */
      explicit: boolean
      /** @description How many episodes the podcast has, taken-down ones included. */
      episodeCount: number
      /**
       * Format: date-time
       * @description Soft-delete (take-down) timestamp.
       */
      deletedAt?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
    }
    PaginatedAdminPodcastsEntity: {
      /** @description The podcasts on this page. */
      data: components['schemas']['AdminPodcastEntity'][]
      /** @description The total number of podcasts matching the query. */
      total: number
      /** @description The current page number. */
      page: number
      /** @description The page size. */
      limit: number
    }
    AdminPodcastEpisodeEntity: {
      /** @description The episode's id. */
      id: string
      /** @description The owning podcast's id. */
      podcastId: string
      /** @description The episode's title. */
      title: string
      /** @description The episode length in seconds, if known. */
      duration?: number | null
      /**
       * Format: date-time
       * @description Release date, or `null` if unset.
       */
      releaseDate?: string | null
      /** @description Whether the episode is flagged explicit. */
      explicit: boolean
      /**
       * Format: date-time
       * @description The episode's own soft-delete timestamp — independent of the podcast's.
       */
      deletedAt?: string | null
    }
    AdminPodcastDetailEntity: {
      /** @description The id value. */
      id: string
      /** @description The title value. */
      title: string
      /** @description The publisher's display name. */
      publisher: string
      /** @description The stored cover image reference, or `null`. */
      cover?: string | null
      /** @description The podcast's language code, if any. */
      language?: string | null
      /** @description Whether the podcast is flagged explicit. */
      explicit: boolean
      /** @description How many episodes the podcast has, taken-down ones included. */
      episodeCount: number
      /**
       * Format: date-time
       * @description Soft-delete (take-down) timestamp.
       */
      deletedAt?: string | null
      /**
       * Format: date-time
       * @description The created at value.
       */
      createdAt: string
      /**
       * Format: date-time
       * @description The updated at value.
       */
      updatedAt: string
      /** @description The podcast description, if any. */
      description?: string | null
      /** @description The podcast's episodes, newest release first, taken-down ones included. */
      episodes: components['schemas']['AdminPodcastEpisodeEntity'][]
    }
  }
  responses: never
  parameters: never
  requestBodies: never
  headers: never
  pathItems: never
}
export type $defs = Record<string, never>
export interface operations {
  AppController_getWelcome_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A plain-text welcome string */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': string
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': string
        }
      }
    }
  }
  AppController_getHealth_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description All dependencies are reachable */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description One or more dependencies (Postgres, Redis, storage) failed or timed out */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AppController_getLiveness_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description The process is up */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AppController_getReadiness_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Every dependency is reachable */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description One or more dependencies failed or timed out */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  StorageController_getImageUrl_v1: {
    parameters: {
      query: {
        /** @description The storage object key */
        key: string
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description The presigned URL and its expiry in seconds */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unsupported image storage key */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Missing or invalid session
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Image not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  StorageController_streamSignedObject_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        token: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Full object stream */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Partial content for a Range request */
      206: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Signed URL invalid, expired, or object not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersAuthController_login_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UserLoginDto']
      }
    }
    responses: {
      /** @description Logged in. If 2FA is not enabled: sets access_token and refresh_token cookies, no body. If 2FA is enabled: returns JSON with requires2fa and pendingToken — no cookies yet. */
      201: {
        headers: {
          /** @description HttpOnly cookies: access_token and refresh_token (only when 2FA is not required) */
          'Set-Cookie'?: string
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['TwoFactorRequiredEntity']
        }
      }
      /** @description Validation error */
      400: {
        headers: {
          [name: string]: unknown
        }
        content: {
          /**
           * @example {
           *       "errors": [
           *         {
           *           "field": "email",
           *           "message": "email must be an email"
           *         }
           *       ]
           *     }
           */
          'application/json': unknown
        }
      }
      /** @description Invalid credentials */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersAuthController_registration_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['RegistrationDto']
      }
    }
    responses: {
      /** @description Successfully registered */
      201: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Validation error */
      400: {
        headers: {
          [name: string]: unknown
        }
        content: {
          /**
           * @example {
           *       "errors": [
           *         {
           *           "field": "email",
           *           "message": "email must be an email"
           *         }
           *       ]
           *     }
           */
          'application/json': unknown
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description User already exists */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersAuthController_logout_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Successfully logged out */
      201: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersAuthController_refresh_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Token refreshed */
      201: {
        headers: {
          /** @description HttpOnly cookies: access_token */
          'Set-Cookie'?: string
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersAuthController_getMe_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description The signed-in account, including its own email and two-factor state */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['SelfUserEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersAuthController_acceptLegal_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['LegalAcceptanceDto']
      }
    }
    responses: {
      /** @description The signed-in account with the acceptance recorded */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['SelfUserEntity']
        }
      }
      /** @description Acceptance was not given */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersAuthController_forgotPassword_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UserForgotPasswordDto']
      }
    }
    responses: {
      /** @description Reset email sent if account exists (no-op otherwise) */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Validation error */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersAuthController_resetPassword_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['ResetPasswordDto']
      }
    }
    responses: {
      /** @description Password changed successfully */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Invalid or expired token */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersAuthController_verifyEmail_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['VerifyEmailDto']
      }
    }
    responses: {
      /** @description Email verified */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Invalid or expired verification token */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersAuthController_resendEmailVerification_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['ResendEmailVerificationDto']
      }
    }
    responses: {
      /** @description Verification email sent, if applicable */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersAuthController_getSessions_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Active sessions, most recent first */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Missing or invalid session
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersAuthController_revokeOtherSessions_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Every other session revoked */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Missing or invalid session
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersAuthController_revokeSession_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Session revoked */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Session not found, or does not belong to the caller */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Missing or invalid session
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersAuthController_twoFactorSetup_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description QR code data URL and manual TOTP secret */
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['UserTwoFactorSetupEntity']
        }
      }
      /** @description 2FA is already enabled */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersAuthController_twoFactorEnable_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['TwoFactorCodeDto']
      }
    }
    responses: {
      /** @description 2FA enabled */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description 2FA setup not started */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Invalid TOTP code or not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersAuthController_twoFactorDisable_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['TwoFactorCodeDto']
      }
    }
    responses: {
      /** @description 2FA disabled */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description 2FA not enabled on this account */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Invalid TOTP code or not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersAuthController_twoFactorVerifyLogin_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['TwoFactorVerifyLoginDto']
      }
    }
    responses: {
      /** @description Authenticated — sets access_token and refresh_token cookies */
      200: {
        headers: {
          /** @description HttpOnly cookies: access_token and refresh_token */
          'Set-Cookie'?: string
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Invalid or expired pending token / TOTP code */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersOAuthController_googleAuth_v1: {
    parameters: {
      query?: {
        /** @description Pass true when the user accepted the Terms of Use and Community Guidelines and read the Privacy Policy. Required to create a new account; ignored for existing accounts. */
        acceptLegal?: boolean
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Redirect to Google OAuth consent screen */
      302: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersOAuthController_googleCallback_v1: {
    parameters: {
      query: {
        /** @description Authorization code from Google */
        code: string
        /** @description CSRF state token */
        state: string
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /**
       * @description Redirect to web app or 2FA login page
       *
       *     Redirect to /login?error=oauth_state_mismatch on CSRF failure
       */
      302: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersOAuthController_facebookAuth_v1: {
    parameters: {
      query?: {
        /** @description Pass true when the user accepted the Terms of Use and Community Guidelines and read the Privacy Policy. Required to create a new account; ignored for existing accounts. */
        acceptLegal?: boolean
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Redirect to Facebook OAuth consent screen */
      302: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersOAuthController_facebookCallback_v1: {
    parameters: {
      query: {
        /** @description Authorization code from Facebook */
        code: string
        /** @description CSRF state token */
        state: string
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /**
       * @description Redirect to web app or 2FA login page
       *
       *     Redirect to /login?error=oauth_state_mismatch on CSRF failure
       */
      302: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersController_getAll_v1: {
    parameters: {
      query?: {
        /** @description Number of users to return per page */
        limit?: number
        /** @description Page number for pagination */
        page?: number
        /** @description Filter users by username */
        username?: string
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description List of users retrieved successfully */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            data: components['schemas']['SafeUserEntity'][]
            total: number
            page: number
            limit: number
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersController_putById_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** @description User data to update */
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateUserDto']
      }
    }
    responses: {
      /** @description User profile updated successfully */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['SafeUserEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersController_getByUsername_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Username of the user to retrieve */
        username: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description User retrieved successfully */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['SafeUserEntity']
        }
      }
      /** @description User not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  UsersController_getById_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description User retrieved successfully */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['SafeUserEntity']
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  UsersController_uploadAvatar_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** @description Avatar file to upload */
    requestBody: {
      content: {
        'multipart/form-data': components['schemas']['UploadAvatarDto']
      }
    }
    responses: {
      /** @description Avatar uploaded successfully */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['SafeUserEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Invalid file type or size */
      422: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersController_follow_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description User id to follow */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Now following the user */
      204: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Cannot follow yourself */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Missing or invalid session
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description User not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersController_unfollow_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description User id to unfollow */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description No longer following the user */
      204: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Missing or invalid session
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  UsersController_following_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of followed users */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Missing or invalid session
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ArtistsController_getAll_v1: {
    parameters: {
      query?: {
        /** @description Page number */
        page?: number
        /** @description Items per page */
        limit?: number
        /** @description Search by artist username */
        username?: string
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            data: components['schemas']['SafeArtistEntity'][]
            total: number
            page: number
            limit: number
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ArtistsController_getById_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Artist ID (UUID) */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['SafeArtistEntity']
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  ArtistsController_updateProfile_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Artist ID (UUID) */
        id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateArtistDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['SafeArtistEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ArtistsController_deleteProfile_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Artist ID (UUID) */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  ArtistsController_getByUsername_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Artist username */
        username: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  ArtistsController_getFollowing_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description List of followed artists */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            data: components['schemas']['FollowedArtistEntity'][]
            total: number
            page: number
            limit: number
          }
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ArtistsController_follow_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Artist ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Artist followed */
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ArtistWithFollowersCountEntity']
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Artist not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ArtistsController_unfollow_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Artist ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Artist unfollowed */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ArtistWithFollowersCountEntity']
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  TracksController_getAll_v1: {
    parameters: {
      query?: {
        /** @description Page number */
        page?: number
        /** @description Items per page */
        limit?: number
        /** @description Return tracks belonging to this artist */
        artistId?: string
        /** @description Search by track title */
        title?: string
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            data: components['schemas']['TrackEntity'][]
            total: number
            page: number
            limit: number
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  TracksController_postTrack_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'multipart/form-data': components['schemas']['CreateTrackDto']
      }
    }
    responses: {
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['TrackEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  TracksController_getHlsMasterPlaylist_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Track ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description The master playlist */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Track not found, or its HLS stream is not ready */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  TracksController_getHlsAsset_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Rendition kbps */
        bitrate: number
        /** @description Playlist or segment filename */
        asset: string
        /** @description Track ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description The requested asset bytes */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Track, rendition, or asset not found, or the track is not ready */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  TracksController_streamTrack_v1: {
    parameters: {
      query?: {
        bitrate?: number
        format?: string
      }
      header?: {
        /** @description Byte range for partial content (e.g. bytes=0-1048575) */
        Range?: string
      }
      path: {
        /** @description Track ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Full audio stream */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'audio/mpeg': string
        }
      }
      /** @description Partial audio stream (Range request) */
      206: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'audio/mpeg': string
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Track not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  TracksController_getById_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Track ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['TrackEntity']
        }
      }
      /** @description Track not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  TracksController_putTrack_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Track ID */
        id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'multipart/form-data': components['schemas']['UpdateTrackDto']
      }
    }
    responses: {
      /** @description Track updated */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['TrackEntity']
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated as artist
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Track not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  TracksController_getLikedTracks_v1: {
    parameters: {
      query?: {
        /** @description Page number */
        page?: number
        /** @description Items per page */
        limit?: number
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          /**
           * @example [
           *       {
           *         "artist": "123",
           *         "title": "Track Title",
           *         "id": "1",
           *         "likedBy": [],
           *         "album": "Album Name",
           *         "albumId": "album123",
           *         "artistId": "artist123",
           *         "cover": "https://example.com/cover.jpg",
           *         "audioUrl": "",
           *         "userId": "",
           *         "createdAt": "2026-01-01T00:00:00.000Z",
           *         "updatedAt": "2026-01-01T00:00:00.000Z",
           *         "duration": 180,
           *         "releaseDate": "2023-10-01T12:00:00.000Z",
           *         "lyrics": null,
           *         "processingStatus": "READY",
           *         "processingError": null,
           *         "processingAttempts": 1,
           *         "processingStartedAt": "2026-01-01T00:00:00.000Z",
           *         "processingFinishedAt": "2026-01-01T00:00:00.000Z"
           *       }
           *     ]
           */
          'application/json': unknown
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  TracksController_getManifest_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Track ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['TrackManifestEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Track not found or has no CMAF renditions */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  TracksController_streamRendition_v1: {
    parameters: {
      query?: never
      header?: {
        /** @description Inclusive byte window, e.g. `bytes=929-100915` */
        Range?: string
      }
      path: {
        /** @description Rendition kbps */
        bitrate: number
        /** @description Track ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Whole rendition file */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'audio/mp4': string
        }
      }
      /** @description Requested byte range */
      206: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'audio/mp4': string
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Rendition not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  TracksController_likeTrack_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Track ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Track liked */
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['TrackEntity']
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Track not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  TracksController_unlikeTrack_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Track ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Track unliked */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['TrackEntity']
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  PlaylistsController_getAll_v1: {
    parameters: {
      query?: {
        /** @description Page number for pagination */
        page?: number
        /** @description Number of items per page */
        limit?: number
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            data: components['schemas']['PlaylistEntity'][]
            total: number
            page: number
            limit: number
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  PlaylistsController_post_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Playlist created */
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PlaylistEntity']
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  PlaylistsController_getMine_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description List of user playlists */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            data: components['schemas']['PlaylistEntity'][]
            total: number
            page: number
            limit: number
          }
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  PlaylistsController_getById_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Playlist id */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PlaylistDetailEntity']
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  PlaylistsController_update_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Playlist ID */
        id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdatePlaylistDto']
      }
    }
    responses: {
      /** @description Playlist updated */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PlaylistEntity']
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Playlist not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  PlaylistsController_deletePlaylist_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Playlist ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Playlist deleted */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PlaylistEntity']
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Playlist not found or not owned by user */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  PlaylistsController_addTracks_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Playlist ID */
        id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['AddTracksDto']
      }
    }
    responses: {
      /** @description Tracks added */
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PlaylistDetailEntity']
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Playlist not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  PlaylistsController_removeTrack_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Track ID */
        trackId: string
        /** @description Playlist ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Track removed */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PlaylistDetailEntity']
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Playlist or track not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  PlaylistsController_likePlaylist_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Playlist ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Playlist liked */
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PlaylistEntity']
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Playlist not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  PlaylistsController_unlikePlaylist_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Playlist ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Playlist unliked */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PlaylistEntity']
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AlbumsController_getAllAlbums_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        /** @description Return albums belonging to this artist */
        artistId?: string
        title?: string
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            data: components['schemas']['AlbumEntity'][]
            total: number
            page: number
            limit: number
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AlbumsController_createAlbum_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAlbumDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AlbumEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AlbumsController_getById_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AlbumEntity']
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AlbumsController_updateAlbum_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateAlbumDto']
      }
    }
    responses: {
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AlbumEntity']
        }
      }
    }
  }
  AlbumsController_deleteAlbum_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AlbumEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AlbumsController_likeAlbum_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Album ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Album liked */
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AlbumEntity']
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Album not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AlbumsController_unlikeAlbum_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Album ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Album unliked */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AlbumEntity']
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AuthController_login_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['ArtistLoginDto']
      }
    }
    responses: {
      /** @description Logged in. If 2FA is not enabled: sets access_token and refresh_token cookies, no body. If 2FA is enabled: returns JSON with requires2fa and pendingToken — no cookies yet. */
      201: {
        headers: {
          /** @description HttpOnly cookies: access_token and refresh_token (only when 2FA is not required) */
          'Set-Cookie'?: string
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['TwoFactorRequiredEntity']
        }
      }
      /** @description Validation error */
      400: {
        headers: {
          [name: string]: unknown
        }
        content: {
          /**
           * @example {
           *       "errors": [
           *         {
           *           "field": "email",
           *           "message": "email must be an email"
           *         }
           *       ]
           *     }
           */
          'application/json': unknown
        }
      }
      /** @description Invalid credentials */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AuthController_registration_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['ArtistRegistrationDto']
      }
    }
    responses: {
      /** @description Successfully registered */
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ArtistRegistrationEntity']
        }
      }
      /** @description Validation error */
      400: {
        headers: {
          [name: string]: unknown
        }
        content: {
          /**
           * @example {
           *       "errors": [
           *         {
           *           "field": "email",
           *           "message": "email must be an email"
           *         }
           *       ]
           *     }
           */
          'application/json': unknown
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description User already exists */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Email verification cannot be delivered; no account was created */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AuthController_emailAvailability_v1: {
    parameters: {
      query: {
        email: string
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Whether the email is available */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            available?: boolean
          }
        }
      }
      /** @description Email query param missing */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AuthController_logout_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Successfully logged out */
      201: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AuthController_refresh_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Token refreshed */
      201: {
        headers: {
          /** @description HttpOnly cookies: access_token */
          'Set-Cookie'?: string
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AuthController_getMe_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description The signed-in artist account */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['SafeArtistEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AuthController_forgotPassword_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['ArtistForgotPasswordDto']
      }
    }
    responses: {
      /** @description Reset email sent if account exists (no-op otherwise) */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Validation error */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AuthController_resetPassword_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['ResetPasswordDto']
      }
    }
    responses: {
      /** @description Password changed successfully */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Invalid or expired token */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AuthController_verifyEmail_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['VerifyArtistEmailDto']
      }
    }
    responses: {
      /** @description Email verified */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Invalid or expired verification token */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AuthController_resendEmail_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['ResendArtistEmailDto']
      }
    }
    responses: {
      /** @description Mail transport mode, not a delivery receipt */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ArtistEmailDeliveryEntity']
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Wait 60 seconds before resending */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AuthController_verifyEmailCode_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['VerifyArtistEmailCodeDto']
      }
    }
    responses: {
      /** @description Email verified */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Invalid, expired or exhausted code */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AuthController_twoFactorSetup_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description QR code data URL and manual TOTP secret */
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ArtistTwoFactorSetupEntity']
        }
      }
      /** @description 2FA is already enabled */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AuthController_twoFactorEnable_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['TwoFactorCodeDto']
      }
    }
    responses: {
      /** @description 2FA enabled */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description 2FA setup not started */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Invalid TOTP code or not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AuthController_twoFactorDisable_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['TwoFactorCodeDto']
      }
    }
    responses: {
      /** @description 2FA disabled */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description 2FA not enabled on this account */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Invalid TOTP code or not authenticated
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AuthController_twoFactorVerifyLogin_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['TwoFactorVerifyLoginDto']
      }
    }
    responses: {
      /** @description Authenticated — sets access_token and refresh_token cookies */
      200: {
        headers: {
          /** @description HttpOnly cookies: access_token and refresh_token */
          'Set-Cookie'?: string
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Invalid or expired pending token / TOTP code */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ArtistsOAuthController_googleAuth_v1: {
    parameters: {
      query?: {
        /** @description Pass true when the user accepted the Terms of Use and Community Guidelines and read the Privacy Policy. Required to create a new account; ignored for existing accounts. */
        acceptLegal?: boolean
        /** @description Pass true when the artist accepted the Artist Agreement. Required to create a new artist account. */
        acceptArtistAgreement?: boolean
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Redirect to Google OAuth consent screen */
      302: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ArtistsOAuthController_googleCallback_v1: {
    parameters: {
      query: {
        /** @description Authorization code from Google */
        code: string
        /** @description CSRF state token */
        state: string
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Redirect to web app or 2FA login page */
      302: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ArtistsOAuthController_facebookAuth_v1: {
    parameters: {
      query?: {
        /** @description Pass true when the user accepted the Terms of Use and Community Guidelines and read the Privacy Policy. Required to create a new account; ignored for existing accounts. */
        acceptLegal?: boolean
        /** @description Pass true when the artist accepted the Artist Agreement. Required to create a new artist account. */
        acceptArtistAgreement?: boolean
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Redirect to Facebook OAuth consent screen */
      302: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ArtistsOAuthController_facebookCallback_v1: {
    parameters: {
      query: {
        /** @description Authorization code from Facebook */
        code: string
        /** @description CSRF state token */
        state: string
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Redirect to web app or 2FA login page */
      302: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  SearchController_search_v1: {
    parameters: {
      query: {
        /** @description Search query */
        q: string
        page?: number
        /** @description Maximum results in each requested type bucket */
        limit?: number
        year?: number
        genre?: string
        artist?: string
        /** @description Entity types to search (defaults to all) */
        types?: ('tracks' | 'artists' | 'albums' | 'playlists')[]
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Results grouped and paginated independently per type; totals contains each bucket count */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['SearchResponseEntity']
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  SearchController_getHistory_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of past searches, most recent first */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Missing or invalid session
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  SearchController_clearHistory_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Search history cleared */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Missing or invalid session
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  HistoryController_record_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        trackId: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Recorded */
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['HistoryEntryRecordedEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  HistoryController_removeTrack_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        trackId: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Track removed from history */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  HistoryController_getHistory_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description History entries with track info */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            data: components['schemas']['HistoryEntryEntity'][]
            total: number
            page: number
            limit: number
          }
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  HistoryController_clearAll_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description History cleared */
      204: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  DiscoveryController_categories_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of genres, sorted alphabetically */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  DiscoveryController_categoryPlaylists_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
      }
      header?: never
      path: {
        /** @description The category (genre) slug */
        slug: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of public playlists, most-followed first */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Category not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  DiscoveryController_feed_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description An ordered list of feed sections */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  DiscoveryController_relatedArtists_v1: {
    parameters: {
      query?: {
        /** @description Maximum related artists to return (1-50, default 12) */
        limit?: number
      }
      header?: never
      path: {
        artistId: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Related artists */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Limit out of range */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Artist not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  DiscoveryController_charts_v1: {
    parameters: {
      query?: {
        /** @description Required when scope is country */
        country?: string
        page?: number
        limit?: number
        /** @description Chart scope (default global) */
        scope?: 'global' | 'viral' | 'country'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A ranked page of tracks with play counts */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Invalid scope, or country scope missing the country param */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  DiscoveryController_topTracks_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        /** @description Listening window (default medium) */
        range?: 'short' | 'medium' | 'long'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A ranked page of the caller’s top tracks */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Invalid time range */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Missing or invalid session
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  DiscoveryController_topArtists_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        /** @description Listening window (default medium) */
        range?: 'short' | 'medium' | 'long'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A ranked page of the caller’s top artists */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Invalid time range */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Missing or invalid session
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  MeController_getSettings_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description The settings row */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Missing or invalid session */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  MeController_updateSettings_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateSettingsDto']
      }
    }
    responses: {
      /** @description The updated settings row */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Validation error */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Missing or invalid session */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  MeController_getPlayer_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description The player state, or null if none exists yet */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Missing or invalid session */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  MeController_updatePlayer_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdatePlayerDto']
      }
    }
    responses: {
      /** @description The updated player state */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Device does not belong to the caller, or track is not ready for playback */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Missing or invalid session */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  MeController_updateQueue_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateQueueDto']
      }
    }
    responses: {
      /** @description The player state with the new queue */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Queue contains unavailable tracks */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Missing or invalid session */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  MeController_devices_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Devices ordered active-first, then by last seen */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Missing or invalid session */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  MeController_upsertDevice_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpsertDeviceDto']
      }
    }
    responses: {
      /** @description The created or updated device */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Missing or invalid session */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Device id does not belong to the caller */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Device is already active */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  MeController_removeDevice_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Device removed */
      204: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Missing or invalid session */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Device not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  MeController_notifications_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of notifications newest-first, plus the total unread count */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Missing or invalid session */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  MeController_readNotification_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Notification marked read */
      204: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Missing or invalid session */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Notification not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  MeController_readAll_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description All notifications marked read */
      204: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Missing or invalid session */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  MeController_subscription_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description The subscription */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Missing or invalid session */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  PodcastsController_getAll_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        /** @description Case-insensitive title search */
        q?: string
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of podcasts with their episode count */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  PodcastsController_getById_v1: {
    parameters: {
      query?: {
        /** @description Episodes page */
        page?: number
        /** @description Episodes page size */
        limit?: number
      }
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description The podcast with a page of its episodes */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Podcast not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  PodcastsController_saved_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of saved episodes, each carrying a savedAt timestamp */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Missing or invalid session
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  PodcastsController_save_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Episode id */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Episode saved */
      204: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Missing or invalid session
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Episode not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  PodcastsController_unsave_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Episode id */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Episode removed from the library */
      204: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /**
       * @description Unauthorized
       *
       *     Missing or invalid session
       */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ReleasesController_findAll_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            data: components['schemas']['ReleaseEntity'][]
            total: number
            page: number
            limit: number
          }
        }
      }
      /** @description Invalid pagination */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ReleasesController_createDraft_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateReleaseDto']
      }
    }
    responses: {
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseEntity']
        }
      }
      /** @description Invalid draft fields */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ReleasesController_findOne_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseEntity']
        }
      }
      /** @description Invalid release ID */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Release unavailable to this artist */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ReleasesController_updateDraft_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateReleaseDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseEntity']
        }
      }
      /** @description Invalid draft fields or release ID */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Release unavailable to this artist */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Release changed since it was read or is no longer a draft */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ReleasesController_workspace_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseWorkspaceEntity']
        }
      }
      /** @description Invalid release ID */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Release unavailable to this artist */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ReleasesController_addContributor_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['AddReleaseContributorDto']
      }
    }
    responses: {
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseContributorAddedEntity']
        }
      }
      /** @description Invalid name, roles or release ID */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Release unavailable to this artist */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Release changed or is no longer a draft */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  ReleasesController_contributor_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
        contributorId: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseContributorEntity']
        }
      }
      /** @description Invalid fields or ID */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Release or credit unavailable to this artist */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ReleasesController_updateContributor_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
        contributorId: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateReleaseContributorDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseContributorEntity']
        }
      }
      /** @description Invalid fields or ID */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Release or credit unavailable to this artist */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Release changed or is no longer a draft */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  ReleasesController_updateRights_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateReleaseRightsDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseEntity']
        }
      }
      /** @description Invalid owner or release ID */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Release unavailable to this artist */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Release changed since it was read or is no longer a draft */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  ReleasesController_replaceSplits_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['ReplaceReleaseSplitsDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseSplitsEntity']
        }
      }
      /** @description Invalid shares, a total above 100% or a contributor from another release */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Release unavailable to this artist */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Release changed since it was read or is no longer a draft */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  ReleasesController_updateTrack_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
        trackId: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateReleaseTrackDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseTrackUpdatedEntity']
        }
      }
      /** @description Invalid ISRC or IDs */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Release or recording unavailable to this artist */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Release changed, is no longer a draft, or the ISRC is already used */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  ReleasesController_submit_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['SubmitReleaseDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseEntity']
        }
      }
      /** @description Review not confirmed or invalid ID */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Release unavailable to this artist */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Release changed since it was read or is no longer a draft */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description The draft has blockers; the body lists them */
      422: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            message?: string
            blockers?: components['schemas']['ReleaseBlockerEntity'][]
          }
        }
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  ReleasesController_withdraw_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['WithdrawReleaseDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Release unavailable to this artist */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Release changed since it was read or is not awaiting review */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ArtistMusicController_counts_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['MusicCountsEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ArtistMusicController_tracks_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        search?: string
        sort?: 'updated' | 'title' | 'oldest'
        status?: 'DRAFT' | 'PROCESSING' | 'READY' | 'NEEDS_CHANGES' | 'PUBLISHED' | 'UPLOAD_FAILED'
        type?: 'ORIGINAL' | 'REMASTER' | 'LIVE' | 'DEMO'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            data: components['schemas']['MusicTrackEntity'][]
            total: number
            page: number
            limit: number
          }
        }
      }
      /** @description Invalid catalogue filters */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ArtistMusicController_releases_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        search?: string
        sort?: 'updated' | 'title' | 'oldest'
        status?: 'DRAFT' | 'READY' | 'SUBMITTED' | 'RELEASED' | 'REJECTED'
        type?: 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            data: components['schemas']['MusicReleaseEntity'][]
            total: number
            page: number
            limit: number
          }
        }
      }
      /** @description Invalid catalogue filters */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            message?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  ModerationController_create_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateReportDto']
      }
    }
    responses: {
      /** @description The report (new or the existing active one) */
      201: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Cannot report your own account */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Missing or invalid session */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Reportable target not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many moderation reports */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminAuthController_login_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['AdminLoginDto']
      }
    }
    responses: {
      /** @description Logged in — sets access_token and refresh_token cookies, no body. */
      201: {
        headers: {
          /** @description HttpOnly cookies: access_token and refresh_token */
          'Set-Cookie'?: string
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Validation error */
      400: {
        headers: {
          [name: string]: unknown
        }
        content: {
          /**
           * @example {
           *       "errors": [
           *         {
           *           "field": "email",
           *           "message": "email must be an email"
           *         }
           *       ]
           *     }
           */
          'application/json': unknown
        }
      }
      /** @description Invalid credentials */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Account is temporarily locked */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminAuthController_logout_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Successfully logged out */
      201: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminAuthController_refresh_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Token refreshed */
      201: {
        headers: {
          /** @description HttpOnly cookies: access_token and refresh_token */
          'Set-Cookie'?: string
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminAuthController_getMe_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description The authenticated staff member */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['StaffEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminModerationController_list_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        status?: 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'REJECTED'
        entityType?: 'track' | 'album' | 'playlist' | 'artist' | 'podcast' | 'episode' | 'user'
        sort?: 'createdAt' | 'status'
        order?: 'asc' | 'desc'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of moderation reports */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PaginatedReportsEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the reports:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminModerationController_resolveMany_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['BatchIdsDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminBatchResultEntity']
        }
      }
      /** @description Empty, malformed or over-100 id list */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /**
       * @description Missing reports:advance
       *
       *     Requires the reports:advance permission
       */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminBatchResultEntity']
        }
      }
    }
  }
  AdminModerationController_dismissMany_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['BatchIdsDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminBatchResultEntity']
        }
      }
      /** @description Empty, malformed or over-100 id list */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /**
       * @description Missing reports:advance
       *
       *     Requires the reports:advance permission
       */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminBatchResultEntity']
        }
      }
    }
  }
  AdminModerationController_exportCsv_v1: {
    parameters: {
      query?: {
        status?: 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'REJECTED'
        entityType?: 'track' | 'album' | 'playlist' | 'artist' | 'podcast' | 'episode' | 'user'
        sort?: 'createdAt' | 'status'
        order?: 'asc' | 'desc'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A CSV attachment (UTF-8 with a byte order mark, CRLF line endings, RFC 4180 quoting) of every row matching the same filters and sort as the list, capped at 50000 rows. Columns, in order: id, status, entityType, entityId, reason, details, reporterId, resolvedAt, createdAt. Dates are ISO 8601 UTC, booleans are true/false, null is an empty cell, and a text cell starting with = + - @ tab or CR is prefixed with a single quote. X-Export-Truncated is true when more rows matched than the cap. */
      200: {
        headers: {
          /** @description true when the export stopped at 50000 rows, otherwise false */
          'X-Export-Truncated'?: 'true' | 'false'
          /** @description attachment; filename="<resource>-<UTC timestamp>.csv" */
          'Content-Disposition'?: string
          [name: string]: unknown
        }
        content: {
          'text/csv': string
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the reports:export permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminModerationController_getById_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminModerationReportDetailEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the reports:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Report not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminModerationController_update_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateReportDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminModerationReportEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the reports:advance permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Report not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminArtistsController_list_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        verified?: boolean
        status?: 'active' | 'deactivated' | 'all'
        /** @description Search username/email */
        q?: string
        sort?: 'username' | 'email' | 'createdAt' | 'monthlyListeners'
        order?: 'asc' | 'desc'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of artists */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PaginatedAdminArtistsEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the artists:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminArtistsController_exportCsv_v1: {
    parameters: {
      query?: {
        verified?: boolean
        status?: 'active' | 'deactivated' | 'all'
        /** @description Search username/email */
        q?: string
        sort?: 'username' | 'email' | 'createdAt' | 'monthlyListeners'
        order?: 'asc' | 'desc'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A CSV attachment (UTF-8 with a byte order mark, CRLF line endings, RFC 4180 quoting) of every row matching the same filters and sort as the list, capped at 50000 rows. Columns, in order: id, username, email, verified, monthlyListeners, country, emailVerifiedAt, twoFactorEnabled, deletedAt, createdAt. Dates are ISO 8601 UTC, booleans are true/false, null is an empty cell, and a text cell starting with = + - @ tab or CR is prefixed with a single quote. X-Export-Truncated is true when more rows matched than the cap. */
      200: {
        headers: {
          /** @description true when the export stopped at 50000 rows, otherwise false */
          'X-Export-Truncated'?: 'true' | 'false'
          /** @description attachment; filename="<resource>-<UTC timestamp>.csv" */
          'Content-Disposition'?: string
          [name: string]: unknown
        }
        content: {
          'text/csv': string
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the artists:export permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminArtistsController_getById_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminArtistDetailEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the artists:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Artist not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminArtistsController_remove_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: {
      content: {
        'application/json': components['schemas']['TakeDownReasonDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminArtistEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /**
       * @description Requires the ADMIN role
       *
       *     Requires the artists:delete permission
       */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Artist not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Artist is already deleted */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminArtistsController_listTracks_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        status?: 'active' | 'deactivated' | 'all'
      }
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of the artist's tracks */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PaginatedAdminArtistTracksEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the artists:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Artist not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminArtistsController_listAlbums_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        status?: 'active' | 'deactivated' | 'all'
      }
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of the artist's albums */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PaginatedAdminArtistAlbumsEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the artists:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Artist not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminArtistsController_updateVerification_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateArtistVerificationDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminArtistEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /**
       * @description Requires the ADMIN role
       *
       *     Requires the artists:verify permission
       */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Artist not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminArtistsController_restore_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: {
      content: {
        'application/json': components['schemas']['TakeDownReasonDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminArtistEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the artists:restore permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Artist not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Artist is not deleted */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminArtistsController_revokeSessions_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: {
      content: {
        'application/json': components['schemas']['TakeDownReasonDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminRevokeSessionsResultEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the artists:revoke-sessions permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Artist not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminUsersController_list_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        status?: 'active' | 'deactivated' | 'all'
        /** @description Search username/email */
        q?: string
        sort?: 'username' | 'email' | 'createdAt'
        order?: 'asc' | 'desc'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of users */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PaginatedAdminUsersEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the users:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminUsersController_exportCsv_v1: {
    parameters: {
      query?: {
        status?: 'active' | 'deactivated' | 'all'
        /** @description Search username/email */
        q?: string
        sort?: 'username' | 'email' | 'createdAt'
        order?: 'asc' | 'desc'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A CSV attachment (UTF-8 with a byte order mark, CRLF line endings, RFC 4180 quoting) of every row matching the same filters and sort as the list, capped at 50000 rows. Columns, in order: id, username, email, emailVerifiedAt, twoFactorEnabled, lockedUntil, deletedAt, createdAt. Dates are ISO 8601 UTC, booleans are true/false, null is an empty cell, and a text cell starting with = + - @ tab or CR is prefixed with a single quote. X-Export-Truncated is true when more rows matched than the cap. */
      200: {
        headers: {
          /** @description true when the export stopped at 50000 rows, otherwise false */
          'X-Export-Truncated'?: 'true' | 'false'
          /** @description attachment; filename="<resource>-<UTC timestamp>.csv" */
          'Content-Disposition'?: string
          [name: string]: unknown
        }
        content: {
          'text/csv': string
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the users:export permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminUsersController_getById_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminUserDetailEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the users:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description User not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminUsersController_remove_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: {
      content: {
        'application/json': components['schemas']['TakeDownReasonDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminUserEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /**
       * @description Requires the ADMIN role
       *
       *     Requires the users:delete permission
       */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description User not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description User is already deleted */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminUsersController_listListeningHistory_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
      }
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of the user's listening history */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PaginatedAdminListeningHistoryEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the users:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description User not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminUsersController_deactivateMany_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['BatchIdsDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminBatchResultEntity']
        }
      }
      /** @description Empty, malformed or over-100 id list */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /**
       * @description Missing users:delete
       *
       *     Requires the users:delete permission
       */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminBatchResultEntity']
        }
      }
    }
  }
  AdminUsersController_restore_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: {
      content: {
        'application/json': components['schemas']['TakeDownReasonDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminUserEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the users:restore permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description User not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description User is not deleted */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminUsersController_revokeSessions_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: {
      content: {
        'application/json': components['schemas']['TakeDownReasonDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminRevokeSessionsResultEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the users:revoke-sessions permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description User not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminTracksController_list_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        processingStatus?: 'PROCESSING' | 'READY' | 'FAILED'
        status?: 'active' | 'deactivated' | 'all'
        /** @description Search by title */
        q?: string
        sort?: 'createdAt' | 'title' | 'processingStatus'
        order?: 'asc' | 'desc'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of tracks */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PaginatedAdminTracksEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the tracks:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminTracksController_exportCsv_v1: {
    parameters: {
      query?: {
        processingStatus?: 'PROCESSING' | 'READY' | 'FAILED'
        status?: 'active' | 'deactivated' | 'all'
        /** @description Search by title */
        q?: string
        sort?: 'createdAt' | 'title' | 'processingStatus'
        order?: 'asc' | 'desc'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A CSV attachment (UTF-8 with a byte order mark, CRLF line endings, RFC 4180 quoting) of every row matching the same filters and sort as the list, capped at 50000 rows. Columns, in order: id, title, artistId, artistUsername, processingStatus, processingError, processingAttempts, processingFinishedAt, deletedAt, createdAt. Dates are ISO 8601 UTC, booleans are true/false, null is an empty cell, and a text cell starting with = + - @ tab or CR is prefixed with a single quote. X-Export-Truncated is true when more rows matched than the cap. */
      200: {
        headers: {
          /** @description true when the export stopped at 50000 rows, otherwise false */
          'X-Export-Truncated'?: 'true' | 'false'
          /** @description attachment; filename="<resource>-<UTC timestamp>.csv" */
          'Content-Disposition'?: string
          [name: string]: unknown
        }
        content: {
          'text/csv': string
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the tracks:export permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminTracksController_getById_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminTrackDetailEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the tracks:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Track not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminTracksController_remove_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: {
      content: {
        'application/json': components['schemas']['TakeDownReasonDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminTrackEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the tracks:delete permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Track not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Track is already deleted */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminTracksController_streamAudio_v1: {
    parameters: {
      query?: {
        /** @description Rendition kbps; defaults to the highest available CMAF rendition */
        bitrate?: number
      }
      header?: {
        /** @description Inclusive byte window, e.g. `bytes=929-100915` */
        Range?: string
      }
      path: {
        /** @description Track ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Whole rendition file */
      200: {
        headers: {
          /** @description Always `bytes` */
          'Accept-Ranges'?: string
          [name: string]: unknown
        }
        content: {
          'audio/mp4': string
        }
      }
      /** @description Requested byte range */
      206: {
        headers: {
          /** @description Always `bytes` */
          'Accept-Ranges'?: string
          /** @description The served byte window, e.g. `bytes 929-100915/205821` */
          'Content-Range'?: string
          [name: string]: unknown
        }
        content: {
          'audio/mp4': string
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the tracks:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Track missing, not READY, or has no CMAF rendition at the requested bitrate */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Requested byte range is not satisfiable — no body */
      416: {
        headers: {
          /** @description Always `bytes` */
          'Accept-Ranges'?: string
          /** @description The satisfiable range, e.g. `bytes *\/205821` */
          'Content-Range'?: string
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminTracksController_probeAudio_v1: {
    parameters: {
      query?: {
        /** @description Rendition kbps; defaults to the highest available CMAF rendition */
        bitrate?: number
      }
      header?: never
      path: {
        /** @description Track ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Rendition headers — HEAD response, no body */
      200: {
        headers: {
          /** @description Always `bytes` */
          'Accept-Ranges'?: string
          /** @description Size in bytes of the rendition file */
          'Content-Length'?: string
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the tracks:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Track missing, not READY, or has no CMAF rendition at the requested bitrate */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminTracksController_listProcessingAttempts_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
      }
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of the track's processing attempts */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PaginatedAdminTrackProcessingAttemptsEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the tracks:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Track not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminTracksController_reprocess_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminTrackEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /**
       * @description Requires the ADMIN role
       *
       *     Requires the tracks:reprocess permission
       */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Track not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminTracksController_takeDownMany_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['BatchIdsDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminBatchResultEntity']
        }
      }
      /** @description Empty, malformed or over-100 id list */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /**
       * @description Missing tracks:delete
       *
       *     Requires the tracks:delete permission
       */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminBatchResultEntity']
        }
      }
    }
  }
  AdminTracksController_restore_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: {
      content: {
        'application/json': components['schemas']['TakeDownReasonDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminTrackEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the tracks:restore permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Track not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Track is not deleted */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminAuditController_list_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        entityType?: string
        entityId?: string
        staffId?: string
        from?: string
        to?: string
        sort?: 'createdAt'
        order?: 'asc' | 'desc'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of audit log entries */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PaginatedAdminAuditLogsEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the audit:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminRolesController_list_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Every role, with operator counts */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['RoleEntity'][]
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the roles:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>[]
        }
      }
    }
  }
  AdminRolesController_create_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRoleDto']
      }
    }
    responses: {
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['RoleEntity']
        }
      }
      /** @description Unknown or protected permission */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the roles:write permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Role name already in use */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminRolesController_permissions_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Every permission, with how many active operators hold it */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['RolePermissionEntity'][]
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the roles:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>[]
        }
      }
    }
  }
  AdminRolesController_getById_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['RoleEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the roles:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Role not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminRolesController_remove_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['RoleEntity']
        }
      }
      /** @description The role is built-in and cannot be deleted */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the roles:write permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Role not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description The role is still assigned to active operators */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminRolesController_update_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateRoleDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['RoleEntity']
        }
      }
      /** @description Unknown/protected permission, or a built-in role edit that is not allowed */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the roles:write permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Role not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Role name already in use */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminStaffController_list_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        sort?: 'username' | 'email' | 'createdAt'
        order?: 'asc' | 'desc'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of operators */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PaginatedAdminStaffEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the staff:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminStaffController_create_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateStaffDto']
      }
    }
    responses: {
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminStaffEntity']
        }
      }
      /** @description Unknown or protected permission */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the staff:write permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Role not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Email or username already in use */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminStaffController_getById_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminStaffEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the staff:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Operator not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminStaffController_remove_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminStaffEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the staff:write permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Operator not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description This would leave no active operator holding the ADMIN role */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminStaffController_assignRole_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['AssignStaffRoleDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminStaffEntity']
        }
      }
      /** @description Unknown or protected permission */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the staff:write permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Operator or role not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description This would leave no active operator holding the ADMIN role */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminStaffController_updatePermissions_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateStaffPermissionsDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminStaffEntity']
        }
      }
      /** @description Unknown/protected permission, or the target holds the built-in ADMIN role */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the staff:write permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Operator not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminOverviewController_get_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminOverviewEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the overview:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminOverviewController_getSeries_v1: {
    parameters: {
      query?: {
        /** @description Window size in UTC calendar days. Default 30, max 365. */
        days?: number
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminOverviewSeriesEntity']
        }
      }
      /** @description Invalid or out-of-range `days` */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the overview:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminOverviewController_getReportsByType_v1: {
    parameters: {
      query?: {
        /** @description Window size in UTC calendar days. Default 30, max 365. */
        days?: number
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminOverviewReportsByTypeEntity']
        }
      }
      /** @description Invalid or out-of-range `days` */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the overview:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminGenresController_list_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        /** @description Search name/slug */
        q?: string
        sort?: 'name' | 'slug' | 'createdAt'
        order?: 'asc' | 'desc'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of genres */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PaginatedAdminGenresEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the genres:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminGenresController_create_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateGenreDto']
      }
    }
    responses: {
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminGenreEntity']
        }
      }
      /** @description Invalid name, slug or colour */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the genres:write permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Slug already in use */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminGenresController_getById_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminGenreEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the genres:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Genre not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminGenresController_remove_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminGenreEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the genres:delete permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Genre not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Genre is still referenced by tracks, albums or artists; the body carries the counts */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminGenresController_update_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateGenreDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminGenreEntity']
        }
      }
      /** @description Invalid name, slug or colour */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the genres:write permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Genre not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Slug already in use */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminAlbumsController_list_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        status?: 'active' | 'deactivated' | 'all'
        artistId?: string
        /** @description Search by title */
        q?: string
        sort?: 'createdAt' | 'title' | 'releaseDate'
        order?: 'asc' | 'desc'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of albums */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PaginatedAdminAlbumsEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the albums:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminAlbumsController_getById_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminAlbumDetailEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the albums:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Album not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminAlbumsController_remove_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: {
      content: {
        'application/json': components['schemas']['TakeDownReasonDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminAlbumEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the albums:delete permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Album not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Album is already deleted */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminAlbumsController_restore_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: {
      content: {
        'application/json': components['schemas']['TakeDownReasonDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminAlbumEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the albums:restore permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Album not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Album is not deleted */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminPlaylistsController_list_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        status?: 'active' | 'deactivated' | 'all'
        ownerId?: string
        /** @description Search by title */
        q?: string
        sort?: 'createdAt' | 'title'
        order?: 'asc' | 'desc'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of playlists */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PaginatedAdminPlaylistsEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the playlists:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminPlaylistsController_getById_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminPlaylistDetailEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the playlists:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Playlist not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminPlaylistsController_remove_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: {
      content: {
        'application/json': components['schemas']['TakeDownReasonDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminPlaylistEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the playlists:delete permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Playlist not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Playlist is already deleted */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminPlaylistsController_setVisibility_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['SetPlaylistVisibilityDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminPlaylistEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the playlists:hide permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Playlist not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Already in the requested visibility, or an un-hide of a playlist no operator hid */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminPlaylistsController_restore_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: {
      content: {
        'application/json': components['schemas']['TakeDownReasonDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminPlaylistEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the playlists:restore permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Playlist not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Playlist is not deleted */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminPodcastsController_list_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        status?: 'active' | 'deactivated' | 'all'
        /** @description Search by title */
        q?: string
        sort?: 'createdAt' | 'title'
        order?: 'asc' | 'desc'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of podcasts */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PaginatedAdminPodcastsEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the podcasts:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminPodcastsController_getById_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminPodcastDetailEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the podcasts:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Podcast not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AdminPodcastsController_remove_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: {
      content: {
        'application/json': components['schemas']['TakeDownReasonDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminPodcastEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the podcasts:delete permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Podcast not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Podcast is already deleted */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminPodcastsController_restore_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
      }
      cookie?: never
    }
    requestBody?: {
      content: {
        'application/json': components['schemas']['TakeDownReasonDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminPodcastEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the podcasts:restore permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Podcast not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Podcast is not deleted */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminPodcastsController_removeEpisode_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
        episodeId: string
      }
      cookie?: never
    }
    requestBody?: {
      content: {
        'application/json': components['schemas']['TakeDownReasonDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminPodcastEpisodeEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the podcasts:delete permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Episode not found on this podcast */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Episode is already deleted */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
  AdminPodcastsController_restoreEpisode_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
        episodeId: string
      }
      cookie?: never
    }
    requestBody?: {
      content: {
        'application/json': components['schemas']['TakeDownReasonDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminPodcastEpisodeEntity']
        }
      }
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            /** @example 401 */
            statusCode?: number
            /**
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'Staff not found'
              | 'Session not found'
            /** @example Unauthorized */
            error?: string
          }
        }
      }
      /** @description Requires the podcasts:restore permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Episode not found on this podcast */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Episode is not deleted */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Record<string, never>
        }
      }
    }
  }
}
