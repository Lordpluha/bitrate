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
  '/api/v1/admin/releases': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * List releases for Bitrate review
     * @description Defaults to SUBMITTED, oldest submission first. Requires releases:read.
     */
    get: operations['AdminReleasesController_list_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/releases/{id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Read a release under review with its tracks, rights, plan and review history */
    get: operations['AdminReleasesController_detail_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/releases/{id}/tracks/{trackId}/audio': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Play the submitted master of a recording */
    get: operations['AdminReleasesController_audio_v1']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/releases/{id}/approve': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Approve a submitted release
     * @description SUBMITTED -> READY. Recorded in the review history and audit log. Requires releases:review.
     */
    post: operations['AdminReleasesController_approve_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/releases/{id}/request-changes': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Request changes to a submitted release
     * @description SUBMITTED -> REJECTED with Markdown feedback on what to change; the artist revises and resubmits. Requires releases:review.
     */
    post: operations['AdminReleasesController_requestChanges_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/releases/{id}/retry-publishing': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Retry publishing a release
     * @description PUBLISH_FAILED -> PUBLISHING. Converted tracks are kept; failed ones are converted again. Recorded in the audit log. Requires releases:review.
     */
    post: operations['AdminReleasesController_retryPublishing_v1']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/admin/releases/{id}/unpublish': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Take a release offline on Bitrate
     * @description RELEASED or artist-hidden UNPUBLISHED -> UNPUBLISHED by Bitrate (moderation, rights claims). The artist cannot publish it again. Recorded in the audit log. Requires releases:review.
     */
    post: operations['AdminReleasesController_takeDown_v1']
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
        | 'releases:read'
        | 'releases:review'
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
      /** @description The resolved entity kind — `track`, `album`, `playlist`, `artist` or `user`. */
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
    TrackProcessingStep: 'CLAIM' | 'PREPARE_TEMP' | 'CMAF_ENCODE' | 'UPLOAD' | 'PUBLISH' | 'CLEANUP'
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
        | 'releases:read'
        | 'releases:review'
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
        | 'releases:read'
        | 'releases:review'
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
        | 'releases:read'
        | 'releases:review'
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
        | 'releases:read'
        | 'releases:review'
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
        | 'releases:read'
        | 'releases:review'
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
        | 'releases:read'
        | 'releases:review'
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
        | 'releases:read'
        | 'releases:review'
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
        | 'releases:read'
        | 'releases:review'
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
        | 'releases:read'
        | 'releases:review'
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
      entityType: 'track' | 'album' | 'playlist' | 'artist' | 'user'
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
    /** @enum {string} */
    AlbumType: 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION'
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
    AdminReleaseEntity: {
      /** Format: uuid */
      id: string
      title: string
      type: components['schemas']['AlbumType']
      status: components['schemas']['ReleaseStatus']
      cover: string | null
      /** Format: date-time */
      submittedAt: string | null
      /** Format: date-time */
      updatedAt: string
      /** Format: uuid */
      artistId: string
      artistUsername: string
      trackCount: number
    }
    PaginatedAdminReleasesEntity: {
      data: components['schemas']['AdminReleaseEntity'][]
      total: number
      page: number
      limit: number
    }
    /** @enum {string} */
    ReleaseMasterOwner: 'ARTIST' | 'OTHER'
    AdminReleaseRightsEntity: {
      masterOwnerType: components['schemas']['ReleaseMasterOwner'] | null
      masterOwnerName: string | null
      /** Format: date-time */
      writersConfirmedAt: string | null
      /** Format: date-time */
      accuracyConfirmedAt: string | null
    }
    AdminReleaseTrackEntity: {
      /** Format: uuid */
      id: string
      title: string
      duration: number | null
      isrc: string | null
      audioFileName: string | null
      hasAudio: boolean
    }
    /** @enum {string} */
    ReleaseCreditRole: 'PERFORMER' | 'PRODUCER' | 'COMPOSER' | 'LYRICIST' | 'OTHER'
    AdminReleaseContributorEntity: {
      /** Format: uuid */
      id: string
      displayName: string
      roles: components['schemas']['ReleaseCreditRole'][]
    }
    /** @enum {string} */
    ReleaseRightType: 'RECORDING' | 'COMPOSITION'
    AdminReleaseSplitEntity: {
      /** Format: uuid */
      contributorId: string
      rightType: components['schemas']['ReleaseRightType']
      shareBasisPoints: number
    }
    /** @enum {string} */
    DeliveryDestination:
      | 'SPOTIFY'
      | 'APPLE_MUSIC'
      | 'YOUTUBE_MUSIC'
      | 'AMAZON_MUSIC'
      | 'DEEZER'
      | 'TIDAL'
    /** @enum {string} */
    ReleaseBlockerCode:
      | 'NO_TRACKS'
      | 'COVER_MISSING'
      | 'TRACK_AUDIO_MISSING'
      | 'TRACK_GENRES_MISSING'
      | 'MASTER_OWNER_MISSING'
      | 'WRITERS_NOT_CONFIRMED'
      | 'CONTRIBUTOR_ROLES_MISSING'
      | 'SPLITS_INCOMPLETE'
    ReleaseBlockerEntity: {
      code: components['schemas']['ReleaseBlockerCode']
      /** Format: uuid */
      contributorId?: string
      /** Format: uuid */
      trackId?: string
      rightType?: components['schemas']['ReleaseRightType']
      totalBasisPoints?: number
    }
    /** @enum {string} */
    ReleaseNoticeCode: 'UPC_MISSING' | 'ISRC_MISSING'
    ReleaseNoticeEntity: {
      code: components['schemas']['ReleaseNoticeCode']
      /** Format: uuid */
      trackId?: string
    }
    AdminReleaseReadinessEntity: {
      blockers: components['schemas']['ReleaseBlockerEntity'][]
      notices: components['schemas']['ReleaseNoticeEntity'][]
    }
    /** @enum {string} */
    ReleaseReviewDecision: 'APPROVED' | 'CHANGES_REQUESTED'
    AdminReleaseReviewEntity: {
      /** Format: uuid */
      id: string
      decision: components['schemas']['ReleaseReviewDecision']
      /** @description Reviewer feedback in Markdown */
      message: string | null
      /** Format: date-time */
      createdAt: string
      reviewerUsername: string | null
    }
    AdminReleaseDetailEntity: {
      /** Format: uuid */
      id: string
      title: string
      type: components['schemas']['AlbumType']
      status: components['schemas']['ReleaseStatus']
      cover: string | null
      /** Format: date-time */
      submittedAt: string | null
      /** Format: date-time */
      updatedAt: string
      /** Format: uuid */
      artistId: string
      artistUsername: string
      trackCount: number
      upc: string | null
      /** Format: date-time */
      scheduledAt: string | null
      rights: components['schemas']['AdminReleaseRightsEntity']
      tracks: components['schemas']['AdminReleaseTrackEntity'][]
      contributors: components['schemas']['AdminReleaseContributorEntity'][]
      splits: components['schemas']['AdminReleaseSplitEntity'][]
      /** @description Empty means worldwide */
      territories: string[]
      destinations: components['schemas']['DeliveryDestination'][]
      readiness: components['schemas']['AdminReleaseReadinessEntity']
      /** @description Newest first */
      reviews: components['schemas']['AdminReleaseReviewEntity'][]
    }
    ApproveReleaseDto: {
      /** @description Optional note to the artist, in Markdown */
      message?: string
      /**
       * Format: date-time
       * @description Release version the reviewer looked at
       */
      expectedUpdatedAt: string
    }
    AdminReleaseDecisionReleaseEntity: {
      /** Format: uuid */
      id: string
      status: components['schemas']['ReleaseStatus']
      /** Format: date-time */
      updatedAt: string
    }
    AdminReleaseDecisionEntity: {
      release: components['schemas']['AdminReleaseDecisionReleaseEntity']
      review: components['schemas']['AdminReleaseReviewEntity']
    }
    RequestReleaseChangesDto: {
      /** @description What the artist must change before resubmitting, in Markdown */
      message: string
      /**
       * Format: date-time
       * @description Release version the reviewer looked at
       */
      expectedUpdatedAt: string
    }
    /** @enum {string} */
    ReleaseType: 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION'
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
        entityType?: 'track' | 'album' | 'playlist' | 'artist' | 'user'
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
        entityType?: 'track' | 'album' | 'playlist' | 'artist' | 'user'
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
        content?: never
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
        content?: never
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
          'application/json': components['schemas']['AdminRevokeSessionsResultEntity']
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
        content?: never
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
        content?: never
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
          'application/json': components['schemas']['AdminRevokeSessionsResultEntity']
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
        content?: never
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
        content?: never
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
        content?: never
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
        content?: never
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
          'application/json': components['schemas']['AdminAlbumEntity']
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
          'application/json': components['schemas']['AdminAlbumEntity']
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
          'application/json': components['schemas']['AdminPlaylistEntity']
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
          'application/json': components['schemas']['AdminPlaylistEntity']
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
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
          'application/json': components['schemas']['AdminPlaylistEntity']
        }
      }
    }
  }
  AdminReleasesController_list_v1: {
    parameters: {
      query?: {
        page?: number
        limit?: number
        status?:
          | 'SUBMITTED'
          | 'READY'
          | 'REJECTED'
          | 'PUBLISHING'
          | 'PUBLISH_FAILED'
          | 'RELEASED'
          | 'ALL'
        /** @description Title or artist handle */
        q?: string
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
          'application/json': components['schemas']['PaginatedAdminReleasesEntity']
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
          }
        }
      }
      /** @description Requires the releases:read permission */
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
  AdminReleasesController_detail_v1: {
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
          'application/json': components['schemas']['AdminReleaseDetailEntity']
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
          }
        }
      }
      /** @description Requires the releases:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Release not found or still a draft */
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
  AdminReleasesController_audio_v1: {
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
          }
        }
      }
      /** @description Requires the releases:read permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description No uploaded audio */
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
  AdminReleasesController_approve_v1: {
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
        'application/json': components['schemas']['ApproveReleaseDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminReleaseDecisionEntity']
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
          }
        }
      }
      /** @description Requires the releases:review permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Release not found */
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
      /** @description Release changed since it was read or is no longer awaiting review */
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
  AdminReleasesController_requestChanges_v1: {
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
        'application/json': components['schemas']['RequestReleaseChangesDto']
      }
    }
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AdminReleaseDecisionEntity']
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
          }
        }
      }
      /** @description Requires the releases:review permission */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Release not found */
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
      /** @description Release changed since it was read or is no longer awaiting review */
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
  AdminReleasesController_retryPublishing_v1: {
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
      /** @description Unauthorized */
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
          }
        }
      }
      /** @description Requires the releases:review permission */
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
      /** @description Release changed or its publishing has not failed */
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
  AdminReleasesController_takeDown_v1: {
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
      /** @description Unauthorized */
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
            /** @description Stable machine-readable error code (the message key); omitted while the staff errors are still untranslated literals. */
            code?: string
          }
        }
      }
      /** @description Requires the releases:review permission */
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
      /** @description Release changed or is not live on Bitrate */
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
}
