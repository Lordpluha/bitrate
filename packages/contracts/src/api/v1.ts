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
    /** Runs the get health operation. */
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
    /** Returns a dependency-free liveness signal. */
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
    /** Returns a bounded, topology-free dependency readiness signal. */
    get: operations['AppController_getReadiness_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/debug-sentry': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Runs the get error operation. */
    get: operations['AppController_getError_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/metrics': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Returns Prometheus-compatible process metrics. */
    get: operations['AppController_getMetrics_v1']
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
    /** Returns a short-lived direct URL for a private cover or profile image. */
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
     * Streams a local object addressed by a signed token, honoring an HTTP Range.
     * @description Local-driver equivalent of an S3 presigned URL. The token embeds the object key and expiry, verified via HMAC.
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
    /** Reissues a verification email without exposing account existence. */
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
    /** Lists the current user's active sessions. */
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
    post: operations['UsersController_follow_v1']
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
    /** Runs the get hls master playlist operation. */
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
    /** Runs the get hls asset operation. */
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
    post: operations['AuthController_resendEmail_v1']
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
    get: operations['SearchController_getHistory_v1']
    put?: never
    post?: never
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
    get: operations['MeController_getSettings_v1']
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
    get: operations['MeController_getPlayer_v1']
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
    get: operations['MeController_devices_v1']
    put?: never
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
    put: operations['PodcastsController_save_v1']
    post?: never
    delete: operations['PodcastsController_unsave_v1']
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
    }
    LoginDto: {
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
    Function: Record<string, never>
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
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
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
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
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
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
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
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
      )[]
    }
    UpdateRoleDto: {
      name?: string
      description?: string | null
      permissions?: (
        | 'reports:read'
        | 'reports:advance'
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
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
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
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
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
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
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
      )[]
    }
    AssignStaffRoleDto: {
      /** Format: uuid */
      roleId: string
      permissions?: (
        | 'reports:read'
        | 'reports:advance'
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
      )[]
    }
    UpdateStaffPermissionsDto: {
      permissions: (
        | 'reports:read'
        | 'reports:advance'
        | 'artists:read'
        | 'artists:verify'
        | 'artists:delete'
        | 'artists:restore'
        | 'artists:revoke-sessions'
        | 'tracks:read'
        | 'tracks:reprocess'
        | 'tracks:delete'
        | 'tracks:restore'
        | 'users:read'
        | 'users:delete'
        | 'users:restore'
        | 'users:revoke-sessions'
        | 'audit:read'
        | 'staff:read'
        | 'staff:write'
        | 'roles:read'
        | 'roles:write'
        | 'overview:read'
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
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
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
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
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
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
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
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      default: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  AppController_getError_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
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
        content?: never
      }
    }
  }
  AppController_getMetrics_v1: {
    parameters: {
      query?: never
      header: {
        authorization: string
      }
      path?: never
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
          'application/json': string
        }
      }
    }
  }
  StorageController_getImageUrl_v1: {
    parameters: {
      query?: {
        key?: string
      }
      header?: never
      path?: never
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
        'application/json': components['schemas']['LoginDto']
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
          'application/json': unknown
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
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
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
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
              | 'User not found'
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
  UsersAuthController_revokeOtherSessions_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
              | 'User not found'
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
          'application/json': {
            /** @description Base64 data URL of QR code image */
            qrCodeDataUrl?: string
            /** @description TOTP secret for manual entry into authenticator app */
            manualCode?: string
          }
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
      query?: never
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
      query?: never
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
  UsersController_unfollow_v1: {
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
              | 'User not found'
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
              | 'User not found'
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
        'application/json': components['schemas']['Function']
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
              | 'Session not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
  TracksController_getHlsMasterPlaylist_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
  TracksController_getHlsAsset_v1: {
    parameters: {
      query?: never
      header?: never
      path: {
        bitrate: number
        asset: string
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
              | 'Session not found'
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
        'multipart/form-data': components['schemas']['Function']
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
              | 'Session not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
              | 'Session not found'
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
              | 'User not found'
              | 'Session not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
              | 'Session not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
          'application/json': components['schemas']['PlaylistEntity'] & {
            tracks?: components['schemas']['TrackEntity'][]
            user?: {
              id?: string
              username?: string
              avatar?: string | null
            }
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
        'application/json': components['schemas']['Function']
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
              | 'Session not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
              | 'Session not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
              | 'Session not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
              | 'Session not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
              | 'Session not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
              | 'Session not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
  AuthController_login_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['LoginDto']
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
          'application/json': unknown
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
  AuthController_getMe_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Successfully logged out */
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
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
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
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
          'application/json': {
            /** @description Base64 data URL of QR code image */
            qrCodeDataUrl?: string
            /** @description TOTP secret for manual entry into authenticator app */
            manualCode?: string
          }
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
      query?: never
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
      query?: never
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
              | 'User not found'
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
  SearchController_clearHistory_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
              | 'User not found'
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
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
        slug: string
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
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
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
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
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
        country?: string
        page?: number
        limit?: number
        scope?: unknown
      }
      header?: never
      path?: never
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
        content?: never
      }
    }
  }
  DiscoveryController_topTracks_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        range?: unknown
      }
      header?: never
      path?: never
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
  DiscoveryController_topArtists_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        range?: unknown
      }
      header?: never
      path?: never
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
  MeController_getSettings_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
              | 'User not found'
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
  MeController_getPlayer_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
              | 'User not found'
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
              | 'User not found'
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
  MeController_devices_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
              | 'User not found'
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
              | 'User not found'
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
              | 'User not found'
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
              | 'User not found'
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
  MeController_readAll_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
  MeController_subscription_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
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
             * @example Invalid or expired token
             * @enum {string}
             */
            message?:
              | 'Access token required'
              | 'Refresh token required'
              | 'Invalid token requirement'
              | 'Invalid or expired token'
              | 'User not found'
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
  PodcastsController_getAll_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        q?: string
      }
      header?: never
      path?: never
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
        content?: never
      }
    }
  }
  PodcastsController_getById_v1: {
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
      /** @description Method not allowed */
      405: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Request timeout */
      408: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
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
              | 'User not found'
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
  PodcastsController_save_v1: {
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
              | 'User not found'
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
  PodcastsController_unsave_v1: {
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
              | 'User not found'
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
              | 'User not found'
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
  AdminAuthController_login_v1: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['LoginDto']
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
        content?: never
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
      /** @description Requested byte range is not satisfiable */
      416: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
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
      /** @description Rendition headers */
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
}
