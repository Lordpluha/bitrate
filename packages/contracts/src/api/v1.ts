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
    /** User login */
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
    /** User registration */
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
    /** User logout */
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
    /** Refresh access token */
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
    /** Get current authenticated user */
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
    /** Send password reset email */
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
    /** Reset password using a one-time token */
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
    /** Start 2FA enrollment — returns QR code and manual secret */
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
    /** Confirm 2FA enrollment with a TOTP code */
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
    /** Disable 2FA — requires current TOTP code to confirm */
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
     * Complete 2FA login
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
    /** Get all users with filters and pagination */
    get: operations['UsersController_getAll_v1']
    /** Update user by id */
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
    /** Get user by username */
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
    /** Get user by id */
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
    /** Upload avatar for user */
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
  '/api/v1/users/me/following/activity': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * What the people the caller follows last played. Declared after `me/following`, before `:id/…`.
     * @description One listen per person from the past week, newest first, from people who share their listening activity.
     */
    get: operations['UsersController_followingActivity_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/users/{id}/followers': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * List who follows a user
     * @description Visible to everyone while the user keeps `followersVisible` on; the owner always sees their own lists.
     */
    get: operations['UsersController_followers_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/users/{id}/following': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * List whom a user follows
     * @description Visible to everyone while the user keeps `followersVisible` on; the owner always sees their own lists.
     */
    get: operations['UsersController_followingOf_v1']
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
  '/api/v1/artists/{id}/top-tracks': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * The artist's most played tracks.
     * @description Ranked by plays in the last 28 days, then all-time plays, then newest release. A play is one listener in one hour.
     */
    get: operations['ArtistsController_getTopTracks_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/{id}/playlists': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Public playlists featuring the artist. */
    get: operations['ArtistsController_getPlaylists_v1']
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
    /** Get all tracks with pagination */
    get: operations['TracksController_getAll_v1']
    put?: never
    /** Create track */
    post: operations['TracksController_postTrack_v1']
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
    /** Get track by id */
    get: operations['TracksController_getById_v1']
    /** Update track by id */
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
    /** Get liked user tracks with pagination */
    get: operations['TracksController_getLikedTracks_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/tracks/{id}/play-sessions': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Open a playback session for a track
     * @description Returns the byte-range manifest and a signed token. Every rendition request must carry it as `?t=`; it lasts the track plus 15 minutes and is revoked on logout and password reset. See ADR-0067.
     */
    post: operations['TracksController_openPlaySession_v1']
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
     * Authorised by the session token alone (D9): a native `<audio>` cannot refresh a cookie.
     * @description Serves bytes for a playback session (`?t=` from `POST /tracks/:id/play-sessions`). A `Range` of at most the largest fragment (~10 s) is served exactly; a missing or longer range gets one response to the end of the file, released no faster than the session budget: real time since it opened plus 60 s of audio. See ADR-0067.
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
    /** Like a track */
    post: operations['TracksController_likeTrack_v1']
    /** Unlike a track */
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
  '/api/v1/playlists/liked': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get by id operation. */
    get: operations['PlaylistsController_getLiked_v1']
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
    /** Get playlist by id */
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
  '/api/v1/albums/by-tracks': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * The album of each listed track, for track-list album columns. Declared before `:id`.
     * @description One entry per requested track, in request order. A track on several albums is shown on its earliest; a single or a deleted album answers null.
     */
    get: operations['AlbumsController_getAlbumsForTracks_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/albums/liked': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** The signed-in user's saved albums. Declared before `:id` so `liked` is not parsed as an id. */
    get: operations['AlbumsController_getLikedAlbums_v1']
    put?: never
    post?: never
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
    /** Artist login */
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
    /** Artist registration */
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
    /** Artist logout */
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
    /** Refresh access token */
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
    /** Get current authenticated artist */
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
    /** Send artist password reset email */
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
    /** Reset artist password using a one-time token */
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
    /** Start 2FA enrollment — returns QR code and manual secret */
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
    /** Confirm 2FA enrollment with a TOTP code */
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
    /** Disable 2FA — requires current TOTP code to confirm */
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
     * Complete 2FA login
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
  '/api/v1/artists/auth/sessions': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * List the devices signed in to this artist account
     * @description Unexpired sessions, most recently used first; the requesting one is marked.
     */
    get: operations['ArtistSessionsController_list_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/sessions/revoke-others': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Sign out every device except this one */
    post: operations['ArtistSessionsController_revokeOthers_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artists/auth/sessions/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post?: never
    /** Sign out one other device */
    delete: operations['ArtistSessionsController_revoke_v1']
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
  '/api/v1/me/friends': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * List the caller's friends with their presence
     * @description Listening friends first, then online, away and offline. `nowPlaying` is set only while a track plays and the friend shares their listening outside a private session.
     */
    get: operations['FriendsController_list_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/me/friend-requests': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** List pending friend requests sent to or by the caller */
    get: operations['FriendsController_requests_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/me/friends/{userId}': {
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
     * Remove a friend
     * @description Follows are left as they are.
     */
    delete: operations['FriendsController_remove_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/users/{id}/friend-request': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Send a friend request
     * @description Idempotent: sending again returns the pending request. When the other user already sent one, it is accepted instead.
     */
    post: operations['FriendsController_send_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/friend-requests/{id}/accept': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Accept a friend request sent to the caller */
    post: operations['FriendsController_accept_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/friend-requests/{id}/decline': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Decline a friend request sent to the caller */
    post: operations['FriendsController_decline_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/friend-requests/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post?: never
    /** Cancel a friend request the caller sent */
    delete: operations['FriendsController_cancel_v1']
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
  '/api/v1/charts/artists': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Get the artists chart
     * @description Artists ranked by distinct listeners. `global` and `country` cover the last 28 days; `viral` covers the last 7.
     */
    get: operations['DiscoveryController_artistCharts_v1']
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
    /**
     * Delete an owned release draft
     * @description Removes a DRAFT release and its recordings from the workspace; its UPC and ISRCs become available again. Submitted, approved or rejected releases cannot be deleted. Requires the previously read updatedAt version; concurrent changes return 409.
     */
    delete: operations['ReleasesController_deleteDraft_v1']
    options?: never
    head?: never
    /**
     * Edit an owned release draft
     * @description Updates title, type, UPC and/or the release timing. Title, type and UPC change only in DRAFT; a request changing only the timing (scheduledAt) is also accepted after approval (READY). Requires the previously read updatedAt version; concurrent changes return 409. Saving a timing does not submit or deliver a release.
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
  '/api/v1/releases/{id}/contributors/self': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Credit the artist alone on an owned draft without credits
     * @description Adds the artist as performer, composer and lyricist with 100% of the master and publishing splits, as a new draft starts. Clears both rights confirmations. Refused once the draft credits anyone, so divided shares are never overwritten.
     */
    post: operations['ReleasesController_creditSelf_v1']
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
    /**
     * Remove a credited participant from an owned draft
     * @description Deletes the credit together with its shares; its tasks become unassigned. Clears both rights confirmations.
     */
    delete: operations['ReleasesController_removeContributor_v1']
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
     * @description Replaces the master owner and the songwriter confirmation in one request. Changing credits later clears the confirmation. Accuracy is confirmed by submitting, not here.
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
    /**
     * Remove a recording from an owned draft
     * @description Deletes the private master and frees the ISRC. Clears the accuracy confirmation.
     */
    delete: operations['ReleaseMediaController_removeTrack_v1']
    options?: never
    head?: never
    /**
     * Rename a recording or set its ISRC on an owned draft
     * @description Updates the title, the ISRC, or both. The ISRC is accepted with or without hyphens and stored compact; it is optional for submission because a distributor can assign one later.
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
     * @description Re-checks every blocker in the same transaction and moves DRAFT to SUBMITTED. The reviewed confirmation is recorded as the accuracy confirmation for the checked data. Creates an internal review request only; it does not deliver the release to streaming services. Missing UPC/ISRC never blocks.
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
  '/api/v1/releases/{id}/revise': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Reopen a release Bitrate sent back for changes
     * @description REJECTED -> DRAFT. Saved data and the review are kept; editing clears confirmations as for any draft.
     */
    post: operations['ReleasesController_revise_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases/{id}/cover': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    /**
     * Upload the artwork of an owned draft
     * @description Replaces the cover with a JPEG, PNG or WebP image up to 20 MB. The content is checked against the declared type. The previous uploaded cover is deleted after the change is saved.
     */
    put: operations['ReleaseMediaController_uploadCover_v1']
    post?: never
    /** Remove the artwork of an owned draft */
    delete: operations['ReleaseMediaController_removeCover_v1']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases/{id}/tracks': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Add a recording to an owned draft from a master file
     * @description Stores a WAV, FLAC, MP3 or OGG master up to 512 MB privately and creates the recording. Nothing is published or delivered. Clears the accuracy confirmation.
     */
    post: operations['ReleaseMediaController_addTrack_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases/{id}/tracks/{trackId}/audio': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Play the uploaded master of an owned recording
     * @description Private to the owner; supports HTTP Range for seeking.
     */
    get: operations['ReleaseMediaController_trackAudio_v1']
    /**
     * Replace the master of a recording on an owned draft
     * @description Attaches a new master to an existing recording, for example one created without audio. The previous master is deleted after the change is saved. Clears the accuracy confirmation.
     */
    put: operations['ReleaseMediaController_replaceTrackAudio_v1']
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases/{id}/tracks/order': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    /**
     * Set the running order of the recordings on an owned draft
     * @description The list names every active recording exactly once. Clears the accuracy confirmation.
     */
    put: operations['ReleaseMediaController_reorderTracks_v1']
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases/{id}/tasks': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * List the tasks of an owned release
     * @description Open work first, then the nearest deadline; at most 200 tasks.
     */
    get: operations['ReleaseTasksController_list_v1']
    put?: never
    /**
     * Add a task to an owned release
     * @description Tasks are planning notes: they stay editable after submission and never change the release version.
     */
    post: operations['ReleaseTasksController_create_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases/{id}/tasks/{taskId}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post?: never
    /** Delete a task */
    delete: operations['ReleaseTasksController_remove_v1']
    options?: never
    head?: never
    /**
     * Edit, assign or complete a task
     * @description Setting DONE records the completion time; moving back clears it.
     */
    patch: operations['ReleaseTasksController_update_v1']
    trace?: never
  }
  '/api/v1/release-tasks': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * List tasks across the artist's releases
     * @description Paginated; OPEN lists everything not done. Counts per status and overdue cover every task.
     */
    get: operations['ArtistTasksController_list_v1']
    put?: never
    post?: never
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
  '/api/v1/artist-dashboard': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Summarize the artist's workspace for the dashboard
     * @description Current release with its blocker count, items needing attention, catalogue counts, upcoming planned dates and open tasks. Read from saved data only.
     */
    get: operations['ArtistDashboardController_summary_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases/{id}/delivery': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Read the delivery plan and store states of an owned release
     * @description Stores read NOT_CONNECTED while no distribution partner is connected; nothing is implied as sent.
     */
    get: operations['ReleaseDeliveryController_read_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases/{id}/delivery-plan': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    /**
     * Replace the delivery plan of an owned draft or approved release
     * @description Sets the planned stores and territories. Saving a plan sends nothing; delivery starts only through a connected partner.
     */
    put: operations['ReleaseDeliveryController_updatePlan_v1']
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/distribution': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** List the delivery plan and store states of the artist's releases */
    get: operations['DistributionController_list_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artist-search': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Search the artist's releases, tracks and tasks by title
     * @description Case-insensitive; at most 5 results per group.
     */
    get: operations['ArtistSearchController_search_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artist-notifications': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * List the artist's notifications
     * @description Derived from tasks, release review and delivery states, newest first; items after the last seen time are unread.
     */
    get: operations['ArtistNotificationsController_list_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artist-notifications/seen': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Mark all current notifications as read */
    post: operations['ArtistNotificationsController_markSeen_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artist-notifications/preferences': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Read which notification categories are switched off */
    get: operations['ArtistNotificationsController_preferences_v1']
    /**
     * Replace the switched-off notification categories
     * @description Email and push are not sent yet, so only the in-app center is affected.
     */
    put: operations['ArtistNotificationsController_updatePreferences_v1']
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artist-analytics': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Bitrate listening analytics for the artist's tracks
     * @description Plays and listeners from Bitrate playback only, per UTC day, with the previous period for comparison. External services read NOT_CONNECTED.
     */
    get: operations['ArtistAnalyticsController_overview_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases/{id}/publish': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Publish an approved release on Bitrate
     * @description Moves READY to PUBLISHING and converts every recording for the Bitrate player. Nothing is visible to listeners until every track converted; the release then becomes RELEASED, its album appears and followers are notified once. A conversion that fails for good makes the release PUBLISH_FAILED until Bitrate retries it. External stores are not involved. Requires the previously read updatedAt version.
     */
    post: operations['ReleasePublishingController_publish_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases/{id}/publish/cancel': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Cancel a scheduled premiere
     * @description SCHEDULED -> READY. The release stays approved and its timing becomes editable again; publish again to go live.
     */
    post: operations['ReleasePublishingController_cancelPremiere_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases/{id}/unpublish': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Take a live release offline
     * @description RELEASED -> UNPUBLISHED. Its tracks stop playing everywhere, including playlists, likes and history; the album page becomes unavailable. Publish it again at any time.
     */
    post: operations['ReleasePublishingController_unpublish_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/releases/{id}/republish': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Publish an offline release again
     * @description UNPUBLISHED -> RELEASED without a new review and without notifying followers again. A release Bitrate took down cannot be republished by the artist.
     */
    post: operations['ReleasePublishingController_republish_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artist-profile': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Read the signed-in artist's profile and account summary */
    get: operations['ArtistProfileController_read_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    /**
     * Edit the public profile
     * @description Handle, bio, country and links. A null link removes it.
     */
    patch: operations['ArtistProfileController_update_v1']
    trace?: never
  }
  '/api/v1/artist-profile/locale': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    /**
     * Set the workspace language
     * @description A preference, not profile content: no version is required and the profile version is left unchanged.
     */
    put: operations['ArtistProfileController_setLocale_v1']
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/artist-profile/{kind}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    /**
     * Upload the avatar or the profile background
     * @description JPEG, PNG or WebP up to 10 MB, checked against its content.
     */
    put: operations['ArtistProfileController_uploadImage_v1']
    post?: never
    /** Remove the avatar or the profile background */
    delete: operations['ArtistProfileController_removeImage_v1']
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
      /** @description Fragment timescale shared by every CMAF rendition; null until the first publish. */
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
      /**
       * Format: date-time
       * @description When listeners could first see the track; null while its release is publishing or offline.
       */
      publishedAt: string | null
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
    PlaySessionEntity: {
      /** @description The track's byte-range playback manifest. */
      manifest: components['schemas']['TrackManifestEntity']
      /**
       * @description Signed token for `GET /tracks/:id/cmaf/:bitrate?t=…`.
       * @example eyJzaWQiOiIuLi4ifQ.c2lnbmF0dXJl
       */
      token: string
      /**
       * @description When the token stops working, in Unix seconds.
       * @example 1793300000
       */
      expiresAt: number
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
    OpenPlaySessionDto: {
      /**
       * Format: uuid
       * @description The Bitrate Connect device playing, as registered at `/me/player/devices`
       */
      deviceId?: string
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
      /** @description Fragment timescale shared by every CMAF rendition; null until the first publish. */
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
      /**
       * Format: date-time
       * @description When listeners could first see the track; null while its release is publishing or offline.
       */
      publishedAt: string | null
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
      /**
       * Format: date-time
       * @description When listeners could first see the album; null while its release is publishing or offline.
       */
      publishedAt: string | null
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
      /** @description The browser the session signed in from. */
      userAgent: string | null
      /**
       * Format: date-time
       * @description The last sign-in or refresh of the session.
       */
      lastUsedAt: string | null
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
    ArtistSessionDeviceEntity: {
      /** Format: uuid */
      id: string
      /** @description Raw browser user agent */
      userAgent: string | null
      /** Format: date-time */
      createdAt: string
      /**
       * Format: date-time
       * @description Last sign-in or refresh; null before it was tracked
       */
      lastUsedAt: string | null
      /** Format: date-time */
      expiresAt: string
      /** @description The session making this request */
      current: boolean
    }
    RevokedArtistSessionsEntity: {
      revoked: number
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
      /** @description False during a private session: the listen was not stored. */
      recorded: boolean
      /** @description The id of the new listening history row, or null when nothing was recorded. */
      id: string | null
      /**
       * Format: date-time
       * @description When the listen was recorded, or null when nothing was recorded.
       */
      listenedAt: string | null
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
    FriendTrackArtistEntity: {
      id: string
      username: string
    }
    FriendTrackEntity: {
      id: string
      title: string
      cover: string | null
      artist: components['schemas']['FriendTrackArtistEntity']
    }
    FriendPresenceEntity: {
      /** @enum {string} */
      status: 'online' | 'away' | 'offline'
      /** Format: date-time */
      lastActiveAt: string | null
      /** @description Only while a track plays and the friend shares their listening */
      nowPlaying: components['schemas']['FriendTrackEntity'] | null
    }
    FriendEntity: {
      user: components['schemas']['SafeUserEntity']
      /** Format: date-time */
      friendsSince: string
      presence: components['schemas']['FriendPresenceEntity']
    }
    FriendRequestEntity: {
      /** Format: uuid */
      id: string
      /** Format: date-time */
      createdAt: string
      user: components['schemas']['SafeUserEntity']
    }
    SentFriendRequestEntity: {
      /** Format: uuid */
      id: string
      /** Format: date-time */
      createdAt: string
    }
    SendFriendRequestResultEntity: {
      /** @enum {string} */
      status: 'pending' | 'accepted'
      request?: components['schemas']['SentFriendRequestEntity']
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
      showListeningActivity?: boolean
      followersVisible?: boolean
      publicPlaylistsOnProfile?: boolean
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
    ReleaseStatus:
      | 'DRAFT'
      | 'READY'
      | 'SUBMITTED'
      | 'RELEASED'
      | 'REJECTED'
      | 'SCHEDULED'
      | 'PUBLISHING'
      | 'PUBLISH_FAILED'
      | 'UNPUBLISHED'
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
      | 'COVER_MISSING'
      | 'TRACK_AUDIO_MISSING'
      | 'MASTER_OWNER_MISSING'
      | 'WRITERS_NOT_CONFIRMED'
      | 'CONTRIBUTOR_ROLES_MISSING'
      | 'SPLITS_INCOMPLETE'
    /** @enum {string} */
    ReleaseRightType: 'RECORDING' | 'COMPOSITION'
    ReleaseBlockerEntity: {
      code: components['schemas']['ReleaseBlockerCode']
      /** Format: uuid */
      contributorId?: string
      /** Format: uuid */
      trackId?: string
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
      /** @description Whether a master audio file was uploaded for this draft */
      hasAudio: boolean
      /** @description Original name of the uploaded file */
      audioFileName: string | null
      audioSizeBytes: number | null
      /** @description Normalised peak levels (0–1) of the master for drawing its waveform; empty until computed */
      waveform: number[]
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
    /**
     * @description Who took the release offline; only the artist can publish their own takedown again
     * @enum {string}
     */
    ReleaseUnpublishedBy: 'ARTIST' | 'ADMIN'
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
    /** @enum {string} */
    ReleaseReviewDecision: 'APPROVED' | 'CHANGES_REQUESTED'
    WorkspaceReviewEntity: {
      decision: components['schemas']['ReleaseReviewDecision']
      /** @description Reviewer feedback in Markdown */
      message: string | null
      /** Format: date-time */
      createdAt: string
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
      /** @description Who took the release offline; only the artist can publish their own takedown again */
      unpublishedBy: components['schemas']['ReleaseUnpublishedBy'] | null
      /**
       * Format: uuid
       * @description The player album created when the release first went live
       */
      albumId: string | null
      rights: components['schemas']['WorkspaceRightsEntity']
      splits: components['schemas']['WorkspaceSplitEntity'][]
      readiness: components['schemas']['ReleaseReadinessEntity']
      latestReview: components['schemas']['WorkspaceReviewEntity'] | null
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
    ReleaseDraftVersionDto: {
      /**
       * Format: date-time
       * @description Release version read before editing
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
    ReleaseContributorRemovedEntity: {
      release: components['schemas']['ReleaseEntity']
      /** Format: uuid */
      contributorId: string
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
      /** @description Deprecated: no longer required; omit it to leave the stored value unchanged */
      writersConfirmed?: boolean
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
      /** @description Recording title shown in the release */
      title?: string
      /** @description ISO 3901 code, with or without hyphens; stored without them. null clears it. Optional for submission. */
      isrc?: string | null
      /**
       * Format: date-time
       * @description Release version read before editing
       */
      expectedUpdatedAt: string
    }
    ReleaseTrackIdentifierEntity: {
      /** Format: uuid */
      id: string
      title: string
      /** @example USRC17607839 */
      isrc: string | null
    }
    ReleaseTrackUpdatedEntity: {
      release: components['schemas']['ReleaseEntity']
      track: components['schemas']['ReleaseTrackIdentifierEntity']
    }
    SubmitReleaseDto: {
      /**
       * @description The artist confirms the information in this draft is accurate
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
    ReviseReleaseDto: {
      /**
       * Format: date-time
       * @description Release version read before submitting
       */
      expectedUpdatedAt: string
    }
    ReleaseCoverUpdatedEntity: {
      release: components['schemas']['ReleaseEntity']
      /**
       * @description Public image path served outside the /api prefix; null after removal
       * @example /static/releases/covers/0192f1c4-7d2b-7c11-9f3e-1a2b3c4d5e6f.jpg
       */
      cover: string | null
    }
    ReleaseTrackUploadedEntity: {
      release: components['schemas']['ReleaseEntity']
      track: components['schemas']['WorkspaceTrackDraftEntity']
    }
    ReorderReleaseTracksDto: {
      /** @description Recording ids in their new order */
      trackIds: string[]
      /**
       * Format: date-time
       * @description Release version read before editing
       */
      expectedUpdatedAt: string
    }
    ReleaseTracksReorderedEntity: {
      release: components['schemas']['ReleaseEntity']
      /** @description Recording ids in their new order */
      trackIds: string[]
    }
    ReleaseTrackRemovedEntity: {
      release: components['schemas']['ReleaseEntity']
      /** Format: uuid */
      trackId: string
    }
    /** @enum {string} */
    ReleaseTaskStatus: 'TODO' | 'IN_PROGRESS' | 'DONE'
    ReleaseTaskAssigneeEntity: {
      /** Format: uuid */
      id: string
      displayName: string
    }
    ReleaseTaskEntity: {
      /** Format: uuid */
      id: string
      /** Format: uuid */
      releaseId: string
      title: string
      notes: string | null
      status: components['schemas']['ReleaseTaskStatus']
      /** Format: date-time */
      dueAt: string | null
      /** Format: date-time */
      completedAt: string | null
      assignee: components['schemas']['ReleaseTaskAssigneeEntity'] | null
      /** Format: date-time */
      createdAt: string
      /** Format: date-time */
      updatedAt: string
    }
    ReleaseTaskListEntity: {
      data: components['schemas']['ReleaseTaskEntity'][]
      total: number
    }
    CreateReleaseTaskDto: {
      /** @description What needs to be done */
      title: string
      /** @description Details or links; empty clears them */
      notes?: string | null
      /** @description Deadline instant, ISO 8601 with milliseconds and timezone; null clears it */
      dueAt?: string | null
      /** @description A participant credited on this release; null leaves the task unassigned */
      assigneeContributorId?: string | null
    }
    UpdateReleaseTaskDto: {
      /** @description What needs to be done */
      title?: string
      /** @description Details or links; empty clears them */
      notes?: string | null
      /** @description Deadline instant, ISO 8601 with milliseconds and timezone; null clears it */
      dueAt?: string | null
      /** @description A participant credited on this release; null leaves the task unassigned */
      assigneeContributorId?: string | null
      /** @enum {string} */
      status?: 'TODO' | 'IN_PROGRESS' | 'DONE'
      /**
       * Format: date-time
       * @description Task version read before editing
       */
      expectedUpdatedAt: string
    }
    DeleteReleaseTaskDto: {
      /**
       * Format: date-time
       * @description Task version read before deleting
       */
      expectedUpdatedAt: string
    }
    ReleaseTaskDeletedEntity: {
      /** Format: uuid */
      id: string
    }
    ArtistTaskReleaseEntity: {
      /** Format: uuid */
      id: string
      title: string
      status: components['schemas']['ReleaseStatus']
    }
    ArtistTaskEntity: {
      /** Format: uuid */
      id: string
      /** Format: uuid */
      releaseId: string
      title: string
      notes: string | null
      status: components['schemas']['ReleaseTaskStatus']
      /** Format: date-time */
      dueAt: string | null
      /** Format: date-time */
      completedAt: string | null
      assignee: components['schemas']['ReleaseTaskAssigneeEntity'] | null
      /** Format: date-time */
      createdAt: string
      /** Format: date-time */
      updatedAt: string
      release: components['schemas']['ArtistTaskReleaseEntity']
    }
    ArtistTaskCountsEntity: {
      TODO: number
      IN_PROGRESS: number
      DONE: number
      /** @description Not done and past their deadline */
      overdue: number
    }
    ArtistTaskPageEntity: {
      data: components['schemas']['ArtistTaskEntity'][]
      total: number
      page: number
      limit: number
      counts: components['schemas']['ArtistTaskCountsEntity']
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
    DashboardCountsEntity: {
      releases: number
      drafts: number
      inReview: number
      released: number
      /** @description Private track drafts in the catalogue */
      tracks: number
    }
    /** @enum {string} */
    AlbumType: 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION'
    DashboardLeadTrackEntity: {
      /** Format: uuid */
      id: string
      title: string
      duration: number | null
      /** @description Normalised peak levels (0–1) for drawing the waveform; empty until computed */
      waveform: number[]
    }
    DashboardCurrentReleaseEntity: {
      /** Format: uuid */
      id: string
      title: string
      type: components['schemas']['AlbumType']
      status: components['schemas']['ReleaseStatus']
      cover: string | null
      /** Format: date-time */
      scheduledAt: string | null
      /** Format: date-time */
      updatedAt: string
      /** @description Submission blockers; 0 unless the release is a draft */
      blockerCount: number
      /** @description First recording in running order that has an uploaded master */
      leadTrack: components['schemas']['DashboardLeadTrackEntity'] | null
    }
    /** @enum {string} */
    DashboardAttentionKind: 'BLOCKERS' | 'CHANGES_REQUESTED' | 'OVERDUE_TASKS'
    DashboardAttentionEntity: {
      kind: components['schemas']['DashboardAttentionKind']
      /** Format: uuid */
      releaseId?: string
      releaseTitle?: string
      count?: number
    }
    DashboardUpcomingEntity: {
      /** Format: uuid */
      id: string
      title: string
      status: components['schemas']['ReleaseStatus']
      /** Format: date-time */
      scheduledAt: string
    }
    DashboardTaskReleaseEntity: {
      /** Format: uuid */
      id: string
      title: string
    }
    DashboardTaskEntity: {
      /** Format: uuid */
      id: string
      title: string
      status: components['schemas']['ReleaseTaskStatus']
      /** Format: date-time */
      dueAt: string | null
      release: components['schemas']['DashboardTaskReleaseEntity']
    }
    DashboardTasksEntity: {
      open: number
      overdue: number
      next: components['schemas']['DashboardTaskEntity'][]
    }
    ArtistDashboardEntity: {
      counts: components['schemas']['DashboardCountsEntity']
      currentRelease: components['schemas']['DashboardCurrentReleaseEntity'] | null
      attention: components['schemas']['DashboardAttentionEntity'][]
      upcoming: components['schemas']['DashboardUpcomingEntity'][]
      tasks: components['schemas']['DashboardTasksEntity']
    }
    DistributionPartnerEntity: {
      /** @description False until a distribution partner is connected */
      connected: boolean
      name: string | null
    }
    /** @enum {string} */
    DeliveryTerritoryMode: 'WORLDWIDE' | 'SELECTED'
    DeliveryTerritoriesEntity: {
      mode: components['schemas']['DeliveryTerritoryMode']
      /**
       * @description Empty when worldwide
       * @example [
       *       "UA",
       *       "PL"
       *     ]
       */
      countries: string[]
    }
    /** @enum {string} */
    DeliveryDestination:
      | 'SPOTIFY'
      | 'APPLE_MUSIC'
      | 'YOUTUBE_MUSIC'
      | 'AMAZON_MUSIC'
      | 'DEEZER'
      | 'TIDAL'
    /**
     * @description NOT_CONNECTED and UNAVAILABLE mean nothing was or can be sent
     * @enum {string}
     */
    DestinationAvailability:
      | 'NOT_CONNECTED'
      | 'UNAVAILABLE'
      | 'NOT_SENT'
      | 'PENDING'
      | 'LIVE'
      | 'FAILED'
      | 'TAKEN_DOWN'
    DeliveryDestinationEntity: {
      destination: components['schemas']['DeliveryDestination']
      /** @description Chosen in the delivery plan */
      planned: boolean
      /** @description NOT_CONNECTED and UNAVAILABLE mean nothing was or can be sent */
      availability: components['schemas']['DestinationAvailability']
      /** @description Partner message, for example a failure reason */
      message: string | null
      /** Format: date-time */
      updatedAt: string | null
    }
    ReleaseDeliveryEntity: {
      /** Format: uuid */
      releaseId: string
      title: string
      status: components['schemas']['ReleaseStatus']
      cover: string | null
      /** Format: date-time */
      updatedAt: string
      partner: components['schemas']['DistributionPartnerEntity']
      territories: components['schemas']['DeliveryTerritoriesEntity']
      destinations: components['schemas']['DeliveryDestinationEntity'][]
      /** @description Whether anything was ever sent to a partner */
      sent: boolean
    }
    UpdateDeliveryPlanDto: {
      /** @description Stores to deliver to; empty keeps the release unplanned */
      destinations: (
        | 'SPOTIFY'
        | 'APPLE_MUSIC'
        | 'YOUTUBE_MUSIC'
        | 'AMAZON_MUSIC'
        | 'DEEZER'
        | 'TIDAL'
      )[]
      /** @description Worldwide, or only the selected countries */
      territories:
        | {
            /** @constant */
            mode: 'WORLDWIDE'
          }
        | {
            /** @constant */
            mode: 'SELECTED'
            countries: string[]
          }
      /**
       * Format: date-time
       * @description Release version read before editing
       */
      expectedUpdatedAt: string
    }
    DeliveryPlanUpdatedEntity: {
      release: components['schemas']['ReleaseEntity']
      delivery: components['schemas']['ReleaseDeliveryEntity']
    }
    DistributionPageEntity: {
      data: components['schemas']['ReleaseDeliveryEntity'][]
      total: number
      page: number
      limit: number
    }
    SearchReleaseEntity: {
      /** Format: uuid */
      id: string
      title: string
      type: components['schemas']['AlbumType']
      status: components['schemas']['ReleaseStatus']
    }
    SearchTrackEntity: {
      /** Format: uuid */
      id: string
      title: string
      status: components['schemas']['ArtistTrackStatus']
      /** Format: uuid */
      releaseId: string | null
    }
    SearchTaskReleaseEntity: {
      /** Format: uuid */
      id: string
      title: string
    }
    SearchTaskEntity: {
      /** Format: uuid */
      id: string
      title: string
      status: components['schemas']['ReleaseTaskStatus']
      release: components['schemas']['SearchTaskReleaseEntity']
    }
    ArtistSearchEntity: {
      releases: components['schemas']['SearchReleaseEntity'][]
      tracks: components['schemas']['SearchTrackEntity'][]
      tasks: components['schemas']['SearchTaskEntity'][]
    }
    /** @enum {string} */
    ArtistNotificationKind:
      | 'TASK_OVERDUE'
      | 'TASK_DUE_SOON'
      | 'CHANGES_REQUESTED'
      | 'DELIVERY_FAILED'
      | 'RELEASE_SUBMITTED'
      | 'RELEASE_APPROVED'
      | 'RELEASE_RELEASED'
      | 'PUBLISH_FAILED'
      | 'DELIVERY_LIVE'
    ArtistNotificationEntity: {
      /** @description Stable per notification, for list keys */
      id: string
      kind: components['schemas']['ArtistNotificationKind']
      /** @description Needs the artist to act, as opposed to an update */
      actionRequired: boolean
      /** Format: uuid */
      releaseId: string
      releaseTitle: string
      taskTitle?: string
      destination?: components['schemas']['DeliveryDestination']
      /** Format: date-time */
      at: string
      unread: boolean
    }
    ArtistNotificationListEntity: {
      data: components['schemas']['ArtistNotificationEntity'][]
      unread: number
      /** Format: date-time */
      seenAt: string | null
    }
    ArtistNotificationsSeenEntity: {
      /** Format: date-time */
      seenAt: string
    }
    /**
     * @description Categories left out of the in-app notification center
     * @enum {string}
     */
    ArtistNotificationCategory: 'TASKS' | 'REVIEW' | 'DELIVERY'
    ArtistNotificationPreferencesEntity: {
      /** @description Categories left out of the in-app notification center */
      mutedInApp: components['schemas']['ArtistNotificationCategory'][]
    }
    UpdateNotificationPreferencesDto: {
      /** @description Categories left out of the in-app notification center */
      mutedInApp: ('TASKS' | 'REVIEW' | 'DELIVERY')[]
    }
    /**
     * @description NO_DATA_YET means nothing was ever played, which is not an observed zero
     * @enum {string}
     */
    ArtistAnalyticsState: 'NO_TRACKS' | 'NO_DATA_YET' | 'READY'
    AnalyticsPeriodEntity: {
      /**
       * Format: date-time
       * @description Start of the first UTC day
       */
      from: string
      /** Format: date-time */
      to: string
      /** @enum {number} */
      days: 7 | 28 | 90
      /** @enum {string} */
      timezone: 'UTC'
    }
    AnalyticsTotalsEntity: {
      plays: number
      /** @description Distinct signed-in listeners */
      listeners: number
    }
    AnalyticsDayEntity: {
      /** @example 2026-10-09 */
      date: string
      /** @description An observed zero when no one played that day */
      plays: number
    }
    AnalyticsTopTrackEntity: {
      /** Format: uuid */
      trackId: string
      title: string
      plays: number
      listeners: number
    }
    AnalyticsExternalSourceEntity: {
      /** @enum {string} */
      source: 'SPOTIFY' | 'APPLE_MUSIC' | 'YOUTUBE_MUSIC'
      /** @enum {string} */
      state: 'NOT_CONNECTED'
    }
    ArtistAnalyticsEntity: {
      /** @description NO_DATA_YET means nothing was ever played, which is not an observed zero */
      state: components['schemas']['ArtistAnalyticsState']
      period: components['schemas']['AnalyticsPeriodEntity']
      /**
       * Format: date-time
       * @description When the data was read
       */
      freshness: string
      totals: components['schemas']['AnalyticsTotalsEntity'] | null
      /** @description The period before */
      previous: components['schemas']['AnalyticsTotalsEntity'] | null
      daily: components['schemas']['AnalyticsDayEntity'][]
      topTracks: components['schemas']['AnalyticsTopTrackEntity'][]
      external: components['schemas']['AnalyticsExternalSourceEntity'][]
    }
    ArtistSocialLinksEntity: {
      /** Format: uri */
      website?: string
      /** Format: uri */
      instagram?: string
      /** Format: uri */
      x?: string
      /** Format: uri */
      youtube?: string
      /** Format: uri */
      tiktok?: string
      /** Format: uri */
      soundcloud?: string
    }
    ArtistProfileEntity: {
      /** Format: uuid */
      id: string
      /** @description Public handle */
      username: string
      /** @description Sign-in email; never shown publicly */
      email: string
      bio: string | null
      /** @example UA */
      country: string | null
      socials: components['schemas']['ArtistSocialLinksEntity']
      /** @description Public image path */
      avatar: string | null
      /** @description Public image path */
      backgroundImage: string | null
      /** @description Bitrate verification badge */
      verified: boolean
      twoFactorEnabled: boolean
      emailVerified: boolean
      /**
       * @description Workspace language; transactional emails follow it where a template exists
       * @enum {string}
       */
      locale: 'en' | 'uk' | 'pl'
      /** Format: date-time */
      updatedAt: string
    }
    UpdateArtistProfileDto: {
      /** @description Public handle: letters, digits, dots, dashes and underscores */
      username?: string
      bio?: string | null
      /** @description ISO 3166-1 alpha-2 country code; null clears it */
      country?: string | null
      /** @description Links shown on the public profile */
      socials?: {
        website?: string | null
        instagram?: string | null
        x?: string | null
        youtube?: string | null
        tiktok?: string | null
        soundcloud?: string | null
      }
      /**
       * Format: date-time
       * @description Profile version read before editing
       */
      expectedUpdatedAt: string
    }
    SetArtistLocaleDto: {
      /**
       * @description Workspace language; transactional emails follow it where a template exists
       * @enum {string}
       */
      locale: 'en' | 'uk' | 'pl'
    }
    ProfileImageVersionDto: {
      /**
       * Format: date-time
       * @description Profile version read before editing
       */
      expectedUpdatedAt: string
    }
    CreateReportDto: {
      /** @enum {string} */
      entityType: 'track' | 'album' | 'playlist' | 'artist' | 'user'
      /** Format: uuid */
      entityId: string
      reason: string
      details?: string
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  UsersController_followingActivity_v1: {
    parameters: {
      query?: {
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
            user: components['schemas']['SafeUserEntity']
            track: components['schemas']['TrackEntity']
            /** Format: date-time */
            listenedAt: string
          }[]
        }
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  UsersController_followers_v1: {
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
      /** @description A page of users */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description The user keeps these lists private */
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
  UsersController_followingOf_v1: {
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
      /** @description A page of users */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description The user keeps these lists private */
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
  ArtistsController_getTopTracks_v1: {
    parameters: {
      query?: {
        limit?: number
      }
      header?: never
      path: {
        /** @description Artist id */
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
          'application/json': components['schemas']['TrackEntity'][]
        }
      }
      /** @description The id is not a UUID */
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
        content: {
          'application/json': Record<string, never>[]
        }
      }
    }
  }
  ArtistsController_getPlaylists_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
      }
      header?: never
      path: {
        /** @description Artist id */
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
          'application/json': {
            data: components['schemas']['PlaylistEntity'][]
            total: number
            page: number
            limit: number
          }
        }
      }
      /** @description The id is not a UUID */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  TracksController_openPlaySession_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Track ID */
        id: string
      }
      cookie?: never
    }
    requestBody?: {
      content: {
        'application/json': components['schemas']['OpenPlaySessionDto']
      }
    }
    responses: {
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['PlaySessionEntity']
        }
      }
      /**
       * @description Unauthorized
       *
       *     Not signed in
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
      /** @description Too many sessions opened */
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
      query: {
        /** @description Playback session token */
        t: unknown
      }
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
      /** @description The requested fragment, or the rest of the file at real-time pace */
      206: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'audio/mp4': string
        }
      }
      /** @description Missing, forged, expired, revoked or other-track session token */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
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
      /** @description Range outside the file */
      416: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description The session is ahead of real time; retry after `Retry-After` seconds */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
        /** @description Only this user's public playlists (a profile page) */
        userId?: string
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  PlaylistsController_getLiked_v1: {
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
            data: components['schemas']['PlaylistEntity'][]
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  AlbumsController_getAlbumsForTracks_v1: {
    parameters: {
      query: {
        /** @description Comma-separated track ids, 1 to 100 */
        trackIds: string
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
            data: {
              /** Format: uuid */
              trackId: string
              album: {
                /** Format: uuid */
                id: string
                title: string
              } | null
            }[]
          }
        }
      }
      /** @description trackIds is missing, malformed or longer than allowed */
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
  AlbumsController_getLikedAlbums_v1: {
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
            data: components['schemas']['AlbumEntity'][]
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ArtistSessionsController_list_v1: {
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
          'application/json': components['schemas']['ArtistSessionDeviceEntity'][]
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ArtistSessionsController_revokeOthers_v1: {
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
          'application/json': components['schemas']['RevokedArtistSessionsEntity']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ArtistSessionsController_revoke_v1: {
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
      /** @description The device was signed out */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
          }
        }
      }
      /** @description No such session on this account */
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
      /** @description The session is the one making this request; use logout instead */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  FriendsController_list_v1: {
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
          'application/json': components['schemas']['FriendEntity'][]
        }
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
  FriendsController_requests_v1: {
    parameters: {
      query?: {
        direction?: 'incoming' | 'outgoing'
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
          'application/json': components['schemas']['FriendRequestEntity'][]
        }
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
  FriendsController_remove_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        userId: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description No longer friends */
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
  FriendsController_send_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description User to befriend */
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
          'application/json': components['schemas']['SendFriendRequestResultEntity']
        }
      }
      /** @description Cannot befriend yourself */
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
      /** @description Already friends */
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
  FriendsController_accept_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Request id */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Now friends */
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
      /** @description No such request for the caller */
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
  FriendsController_decline_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Request id */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Request declined */
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
      /** @description No such request for the caller */
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
  FriendsController_cancel_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Request id */
        id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Request cancelled */
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
      /** @description No such request for the caller */
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
        /** @description Only tracks in this browse category (genre slug) */
        genre?: string
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
      /** @description Unknown genre */
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
  DiscoveryController_artistCharts_v1: {
    parameters: {
      query?: {
        /** @description Required when scope is country */
        country?: string
        page?: number
        limit?: number
        scope?: 'global' | 'viral' | 'country'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A ranked page of artists with listener counts */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
        content?: never
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ReleasesController_deleteDraft_v1: {
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
        'application/json': components['schemas']['ReleaseDraftVersionDto']
      }
    }
    responses: {
      /** @description Draft deleted */
      204: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Missing version or invalid release ID */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
        content?: never
      }
    }
  }
  ReleasesController_creditSelf_v1: {
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
        'application/json': components['schemas']['ReleaseDraftVersionDto']
      }
    }
    responses: {
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseContributorEntity']
        }
      }
      /** @description Invalid version or release ID */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
      /** @description Release changed, is no longer a draft or already credits someone */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ReleasesController_removeContributor_v1: {
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
        'application/json': components['schemas']['ReleaseDraftVersionDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseContributorRemovedEntity']
        }
      }
      /** @description Invalid version or ID */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
        content?: never
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ReleaseMediaController_removeTrack_v1: {
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
        'application/json': components['schemas']['ReleaseDraftVersionDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseTrackRemovedEntity']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
      /** @description Invalid title, ISRC or IDs */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
        content?: never
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
        content?: never
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ReleasesController_revise_v1: {
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
        'application/json': components['schemas']['ReviseReleaseDto']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
      /** @description Release changed since it was read or no changes were requested */
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
  ReleaseMediaController_uploadCover_v1: {
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
        'multipart/form-data': {
          /** Format: binary */
          cover: string
          /**
           * Format: date-time
           * @description Release version read before editing
           */
          expectedUpdatedAt: string
        }
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseCoverUpdatedEntity']
        }
      }
      /** @description Missing, oversized or invalid image */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ReleaseMediaController_removeCover_v1: {
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
        'application/json': components['schemas']['ReleaseDraftVersionDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseCoverUpdatedEntity']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ReleaseMediaController_addTrack_v1: {
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
        'multipart/form-data': {
          /** Format: binary */
          audio: string
          title: string
          /**
           * Format: date-time
           * @description Release version read before editing
           */
          expectedUpdatedAt: string
        }
      }
    }
    responses: {
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseTrackUploadedEntity']
        }
      }
      /** @description Missing, oversized or unsupported audio, or an invalid title */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ReleaseMediaController_trackAudio_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
        trackId: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Audio bytes */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Requested byte range */
      206: {
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
          'audio/*': {
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
          }
        }
      }
      /** @description No uploaded audio for this recording */
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
  ReleaseMediaController_replaceTrackAudio_v1: {
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
        'multipart/form-data': {
          /** Format: binary */
          audio: string
          /**
           * Format: date-time
           * @description Release version read before editing
           */
          expectedUpdatedAt: string
        }
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseTrackUploadedEntity']
        }
      }
      /** @description Missing or unsupported audio */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ReleaseMediaController_reorderTracks_v1: {
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
        'application/json': components['schemas']['ReorderReleaseTracksDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseTracksReorderedEntity']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
      /** @description The list does not match the recordings on the draft */
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
  ReleaseTasksController_list_v1: {
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
          'application/json': components['schemas']['ReleaseTaskListEntity']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
          }
        }
      }
      /** @description Release or task unavailable to this artist */
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
  ReleaseTasksController_create_v1: {
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
        'application/json': components['schemas']['CreateReleaseTaskDto']
      }
    }
    responses: {
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseTaskEntity']
        }
      }
      /** @description Invalid fields, or an assignee not credited on this release */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
          }
        }
      }
      /** @description Release or task unavailable to this artist */
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
  ReleaseTasksController_remove_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
        taskId: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['DeleteReleaseTaskDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseTaskDeletedEntity']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
          }
        }
      }
      /** @description Release or task unavailable to this artist */
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
      /** @description Task changed since it was read */
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
  ReleaseTasksController_update_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        id: string
        taskId: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateReleaseTaskDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ReleaseTaskEntity']
        }
      }
      /** @description Invalid fields, or an assignee not credited on this release */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
          }
        }
      }
      /** @description Release or task unavailable to this artist */
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
      /** @description Task changed since it was read */
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
  ArtistTasksController_list_v1: {
    parameters: {
      query?: {
        status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'OPEN'
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
          'application/json': components['schemas']['ArtistTaskPageEntity']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
        status?:
          | 'DRAFT'
          | 'READY'
          | 'SUBMITTED'
          | 'RELEASED'
          | 'REJECTED'
          | 'SCHEDULED'
          | 'PUBLISHING'
          | 'PUBLISH_FAILED'
          | 'UNPUBLISHED'
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ArtistDashboardController_summary_v1: {
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
          'application/json': components['schemas']['ArtistDashboardEntity']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ReleaseDeliveryController_read_v1: {
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
          'application/json': components['schemas']['ReleaseDeliveryEntity']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ReleaseDeliveryController_updatePlan_v1: {
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
        'application/json': components['schemas']['UpdateDeliveryPlanDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['DeliveryPlanUpdatedEntity']
        }
      }
      /** @description Invalid stores or country codes */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
      /** @description Release changed since it was read, or is under review or released */
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
  DistributionController_list_v1: {
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
          'application/json': components['schemas']['DistributionPageEntity']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ArtistSearchController_search_v1: {
    parameters: {
      query: {
        q: string
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
          'application/json': components['schemas']['ArtistSearchEntity']
        }
      }
      /** @description Query shorter than 2 characters */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ArtistNotificationsController_list_v1: {
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
          'application/json': components['schemas']['ArtistNotificationListEntity']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ArtistNotificationsController_markSeen_v1: {
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
          'application/json': components['schemas']['ArtistNotificationsSeenEntity']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ArtistNotificationsController_preferences_v1: {
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
          'application/json': components['schemas']['ArtistNotificationPreferencesEntity']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ArtistNotificationsController_updatePreferences_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateNotificationPreferencesDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ArtistNotificationPreferencesEntity']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ArtistAnalyticsController_overview_v1: {
    parameters: {
      query?: {
        days?: 7 | 28 | 90
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
          'application/json': components['schemas']['ArtistAnalyticsEntity']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ReleasePublishingController_publish_v1: {
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
        'application/json': components['schemas']['ReleaseDraftVersionDto']
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
      /** @description Missing version or invalid release ID */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
      /** @description Release changed since it was read or is not approved for publishing */
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
  ReleasePublishingController_cancelPremiere_v1: {
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
        'application/json': components['schemas']['ReleaseDraftVersionDto']
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
      /** @description Missing version or invalid release ID */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
      /** @description Release changed since it was read or has no scheduled premiere */
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
  ReleasePublishingController_unpublish_v1: {
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
        'application/json': components['schemas']['ReleaseDraftVersionDto']
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
      /** @description Missing version or invalid release ID */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
      /** @description Release changed since it was read or is not live on Bitrate */
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
  ReleasePublishingController_republish_v1: {
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
        'application/json': components['schemas']['ReleaseDraftVersionDto']
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
      /** @description Missing version or invalid release ID */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
      /** @description Release changed since it was read or cannot be published again */
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
  ArtistProfileController_read_v1: {
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
          'application/json': components['schemas']['ArtistProfileEntity']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ArtistProfileController_update_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateArtistProfileDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ArtistProfileEntity']
        }
      }
      /** @description Invalid fields or links */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
      /** @description Profile changed since it was read, or the handle is taken */
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
  ArtistProfileController_setLocale_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['SetArtistLocaleDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ArtistProfileEntity']
        }
      }
      /** @description Unsupported language */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
  ArtistProfileController_uploadImage_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        kind: 'avatar' | 'background'
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'multipart/form-data': {
          /** Format: binary */
          image: string
          /** Format: date-time */
          expectedUpdatedAt: string
        }
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ArtistProfileEntity']
        }
      }
      /** @description Missing, oversized or invalid image */
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
      /** @description Profile changed since it was read, or the handle is taken */
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
  ArtistProfileController_removeImage_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        kind: 'avatar' | 'background'
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['ProfileImageVersionDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ArtistProfileEntity']
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
            /**
             * @description Stable machine-readable error code (the message key); omitted for untranslated legacy messages.
             * @example errors.auth.invalid_or_expired_token
             * @enum {string}
             */
            code?:
              | 'errors.auth.access_token_required'
              | 'errors.auth.refresh_token_required'
              | 'errors.auth.invalid_token_requirement'
              | 'errors.auth.invalid_or_expired_token'
              | 'errors.auth.user_not_found'
              | 'errors.auth.session_not_found'
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
      /** @description Profile changed since it was read, or the handle is taken */
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
        content?: never
      }
    }
  }
}
