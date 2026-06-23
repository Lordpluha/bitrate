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
    get: operations['UsersAuthController_googleAuth_v1']
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
     * @description Handled by Google after user consents. On success sets auth cookies and redirects to WEB_HOST. On 2FA required, redirects to /login/2fa with a pending token.
     */
    get: operations['UsersAuthController_googleCallback_v1']
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
    get: operations['UsersAuthController_facebookAuth_v1']
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
     * @description Handled by Facebook after user consents. On success sets auth cookies and redirects to WEB_HOST. On 2FA required, redirects to /login/2fa with a pending token.
     */
    get: operations['UsersAuthController_facebookCallback_v1']
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
    get: operations['AuthController_googleAuth_v1']
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
     * @description Handled by Google after artist consents. On success sets auth cookies and redirects to WEB_HOST. On 2FA required, redirects to /login/2fa with a pending token.
     */
    get: operations['AuthController_googleCallback_v1']
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
    get: operations['AuthController_facebookAuth_v1']
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
     * @description Handled by Facebook after artist consents. On success sets auth cookies and redirects to WEB_HOST. On 2FA required, redirects to /login/2fa with a pending token.
     */
    get: operations['AuthController_facebookCallback_v1']
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
    /** Runs the search operation. */
    get: operations['SearchController_search_v1']
    put?: never
    post?: never
    delete?: never
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
      expiresAt: string | null
    }
    LoginDto: {
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
    }
    ForgotPasswordDto: {
      /**
       * @description The email value.
       * @example artist@example.com
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
    }
    SafeUserEntity: {
      /** @description The id value. */
      id: string
      /** @description The username value. */
      username: string
      /** @description The email value. */
      email: string
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
      /** @description The two factor enabled value. */
      twoFactorEnabled: boolean
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
      cover: string
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
      cover: string
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
      expiresAt: string | null
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
        'application/json': components['schemas']['ForgotPasswordDto']
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
  UsersAuthController_googleAuth_v1: {
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
  UsersAuthController_googleCallback_v1: {
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
  UsersAuthController_facebookAuth_v1: {
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
  UsersAuthController_facebookCallback_v1: {
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
        username?: unknown
        page?: unknown
        limit?: unknown
      }
      header?: never
      path: {
        /** @description Number of users to return per page */
        limit: number
        /** @description Page number for pagination */
        page: number
        /** @description Filter users by username */
        username: string
      }
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
          'application/json': components['schemas']['SafeUserEntity'][]
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
        content?: never
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
          'application/json': components['schemas']['SafeArtistEntity'][]
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
          'application/json': Record<string, never>[]
        }
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
        content: {
          'application/json': Record<string, never>
        }
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
        content: {
          'application/json': Record<string, never>
        }
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
           *         "createdAt": "2026-06-23T09:07:51.284Z",
           *         "updatedAt": "2026-06-23T09:07:51.284Z",
           *         "duration": 180,
           *         "releaseDate": "2023-10-01T12:00:00.000Z",
           *         "lyrics": null,
           *         "processingStatus": "READY",
           *         "processingError": null,
           *         "processingAttempts": 1,
           *         "processingStartedAt": "2026-06-23T09:07:51.284Z",
           *         "processingFinishedAt": "2026-06-23T09:07:51.284Z"
           *       }
           *     ]
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
      /** @description Too many requests */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not implemented */
      501: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Bad gateway */
      502: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Service unavailable */
      503: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Gateway timeout */
      504: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HTTP version not supported */
      505: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Insufficient storage */
      507: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Loop detected */
      508: {
        headers: {
          [name: string]: unknown
        }
        content?: never
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
        content: {
          'application/json': Record<string, never>
        }
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
           *         "createdAt": "2026-06-23T09:07:51.285Z",
           *         "updatedAt": "2026-06-23T09:07:51.285Z",
           *         "duration": 180,
           *         "releaseDate": "2023-10-01T12:00:00.000Z",
           *         "lyrics": null,
           *         "processingStatus": "READY",
           *         "processingError": null,
           *         "processingAttempts": 1,
           *         "processingStartedAt": "2026-06-23T09:07:51.285Z",
           *         "processingFinishedAt": "2026-06-23T09:07:51.285Z"
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
          'application/json': components['schemas']['PlaylistEntity'][]
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
          'application/json': Record<string, never>[]
        }
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
      query?: never
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
        content: {
          'application/json': Record<string, never>[]
        }
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
        content: {
          'application/json': Record<string, never>
        }
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
        content: {
          'application/json': Record<string, never>
        }
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
        content: {
          'application/json': Record<string, never>
        }
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
  AlbumsController_getAllAlbums_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        title?: unknown
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
        content: {
          'application/json': components['schemas']['AlbumEntity'][]
        }
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
        'application/json': components['schemas']['ForgotPasswordDto']
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
  AuthController_googleAuth_v1: {
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
  AuthController_googleCallback_v1: {
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
  AuthController_facebookAuth_v1: {
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
  AuthController_facebookCallback_v1: {
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
        /** @description Max results per type */
        limit?: number
        /** @description Entity types to search (defaults to all) */
        types?: ('tracks' | 'artists' | 'albums' | 'playlists')[]
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Search results grouped by type */
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
        content: {
          'application/json': Record<string, never>
        }
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
}
