export interface paths {
    "/api/v1": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AppController_getWelcome_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AppController_getHealth_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** User login */
        post: operations["UsersAuthController_login_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/registration": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** User registration */
        post: operations["UsersAuthController_registration_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** User logout */
        post: operations["UsersAuthController_logout_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Refresh access token */
        post: operations["UsersAuthController_refresh_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get current authenticated user */
        get: operations["UsersAuthController_getMe_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get all users with filters and pagination */
        get: operations["UsersController_getAll_v1"];
        /** Update user by id */
        put: operations["UsersController_putById_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/username/{username}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get user by username */
        get: operations["UsersController_getByUsername_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get user by id */
        get: operations["UsersController_getById_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/avatar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Upload avatar for user */
        post: operations["UsersController_uploadAvatar_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/artists": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get all artists with pagination */
        get: operations["ArtistsController_getAll_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/artists/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get artist by id */
        get: operations["ArtistsController_getById_v1"];
        /** Update artist profile */
        put: operations["ArtistsController_updateProfile_v1"];
        post?: never;
        /** Delete artist profile */
        delete: operations["ArtistsController_deleteProfile_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/artists/username/{username}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get artist by username */
        get: operations["ArtistsController_getByUsername_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get all tracks with pagination */
        get: operations["TracksController_getAll_v1"];
        put?: never;
        /** Create track */
        post: operations["TracksController_postTrack_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracks/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get track by id */
        get: operations["TracksController_getById_v1"];
        /** Update track by id */
        put: operations["TracksController_putTrack_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracks/stream/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["TracksController_streamTrack_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/playlists": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get all playlists with pagination and filters */
        get: operations["PlaylistsController_getAll_v1"];
        put?: never;
        /** Create a new playlist */
        post: operations["PlaylistsController_post_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/playlists/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get playlist by id */
        get: operations["PlaylistsController_getById_v1"];
        /** Update playlist by id */
        put: operations["PlaylistsController_update_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/albums": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get all albums with pagination and filters */
        get: operations["AlbumsController_getAllAlbums_v1"];
        put?: never;
        /** Create a new album */
        post: operations["AlbumsController_createAlbum_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/albums/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get album by id */
        get: operations["AlbumsController_getById_v1"];
        /** Update album by id */
        put: operations["AlbumsController_updateAlbum_v1"];
        post?: never;
        /**
         * Delete an album by ID
         * @description Deletes an album by its ID. Requires authentication.
         */
        delete: operations["AlbumsController_deleteAlbum_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/artists/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** User login */
        post: operations["AuthController_login_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/artists/auth/registration": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** User registration */
        post: operations["AuthController_registration_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/artists/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** User logout */
        post: operations["AuthController_logout_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/artists/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Refresh access token */
        post: operations["AuthController_refresh_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/artists/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get current authenticated user */
        get: operations["AuthController_getMe_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>
export interface components {
    schemas: {
        UserSessionEntity: {
            id: string;
            userId: string;
            access_token: string;
            refresh_token: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            expiresAt: string | null;
        };
        LoginDto: {
            /**
             * @description User email
             * @example user@example.com
             */
            email: string;
            /**
             * @description User password
             * @example password123
             */
            password: string;
        };
        RegistrationDto: {
            /**
             * @description New user email
             * @example newuser@example.com
             */
            email: string;
            /**
             * @description New user password
             * @example password123
             */
            password: string;
            /**
             * @description New user username
             * @example newuser123
             */
            username: string;
        };
        UserEntity: {
            id: string;
            username: string;
            email: string;
            password: string;
            /** Format: date-time */
            createdAt: string;
            description: string | null;
            avatar: string | null;
            /** Format: date-time */
            updatedAt: string;
        };
        SafeUserEntity: {
            id: string;
            username: string;
            email: string;
            /** Format: date-time */
            createdAt: string;
            description: string | null;
            avatar: string | null;
            /** Format: date-time */
            updatedAt: string;
        };
        UpdateUserDto: {
            /**
             * @description Username of the user
             * @example john_doe
             */
            username: string;
            /**
             * @description Email of the user
             * @example example@gmail.com
             */
            email: string;
            /**
             * @description Description of the user
             * @example This is a sample description
             */
            description?: string;
        };
        UploadAvatarDto: {
            /**
             * Format: binary
             * @description User avatar
             */
            avatar: string;
        };
        ArtistEntity: {
            id: string;
            username: string;
            password: string;
            email: string;
            bio: string | null;
            avatar: string | null;
            backgroundImage: string | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        SafeArtistEntity: {
            id: string;
            username: string;
            bio: string | null;
            avatar: string | null;
            backgroundImage: string | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        TrackEntity: {
            id: string;
            title: string;
            audioUrl: string;
            cover: string;
            /** Format: date-time */
            createdAt: string;
            artistId: string;
            /** Format: date-time */
            updatedAt: string;
            duration: number | null;
            /** Format: date-time */
            releaseDate: string | null;
            lyrics: string | null;
        };
        CreateTrackDto: {
            /** @description Track title */
            title: string;
            /**
             * Format: binary
             * @description Audio file
             */
            audio: string;
            /**
             * Format: binary
             * @description Cover image file
             */
            cover?: string;
        };
        PlaylistEntity: {
            id: string;
            title: string;
            cover: string;
            description: string | null;
            /** Format: date-time */
            createdAt: string;
            userId: string;
            /** Format: date-time */
            updatedAt: string;
            isPublic: boolean;
        };
        CreatePlaylistDto: {
            /** @description Playlist title */
            title: string;
            /** @example user123 */
            description?: string;
        };
        UpdatePlaylistDto: {
            /** @description Playlist title */
            title: string;
            /** @example user123 */
            description?: string;
        };
        AlbumEntity: {
            id: string;
            title: string;
            cover: string;
            artistId: string;
            description: string | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
            /** Format: date-time */
            releaseDate: string | null;
        };
        CreateAlbumDto: {
            /** @description Playlist title */
            title: string;
            /** @example user123 */
            description?: string;
        };
        UpdateAlbumDto: {
            /** @description Playlist title */
            title: string;
            /** @example user123 */
            description?: string;
        };
        ArtistSessionEntity: {
            id: string;
            artistId: string;
            access_token: string;
            refresh_token: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            expiresAt: string | null;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>
export interface operations {
    AppController_getWelcome_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    AppController_getHealth_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersAuthController_login_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            /** @description Successfully logged in */
            201: {
                headers: {
                    /** @description HttpOnly cookies: access_token и refresh_token */
                    "Set-Cookie"?: string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation error */
            400: {
                headers: {
                    [name: string]: unknown;
                };
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
                    "application/json": unknown;
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersAuthController_registration_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegistrationDto"];
            };
        };
        responses: {
            /** @description Successfully registered */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation error */
            400: {
                headers: {
                    [name: string]: unknown;
                };
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
                    "application/json": unknown;
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description User already exists */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersAuthController_logout_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successfully logged out */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersAuthController_refresh_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Token refreshed */
            201: {
                headers: {
                    /** @description HttpOnly cookies: access_token */
                    "Set-Cookie"?: string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersAuthController_getMe_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successfully logged out */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SafeUserEntity"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_getAll_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Number of users to return per page */
                limit: number;
                /** @description Page number for pagination */
                page: number;
                /** @description Filter users by username */
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of users retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SafeUserEntity"][];
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_putById_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description User data to update */
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateUserDto"];
            };
        };
        responses: {
            /** @description User profile updated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SafeUserEntity"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_getByUsername_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Username of the user to retrieve */
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description User retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SafeUserEntity"];
                };
            };
            /** @description User not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": Record<string, never>;
                };
            };
        };
    };
    UsersController_getById_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description User retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SafeUserEntity"];
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_uploadAvatar_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Avatar file to upload */
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["UploadAvatarDto"];
            };
        };
        responses: {
            /** @description Avatar uploaded successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SafeUserEntity"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid file type or size */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ArtistsController_getAll_v1: {
        parameters: {
            query?: {
                /** @description Page number */
                page?: number;
                /** @description Items per page */
                limit?: number;
                /** @description Search by artist username */
                username?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example [
                     *       {
                     *         "avatar": "https://example.com/avatar.jpg",
                     *         "id": "1",
                     *         "username": "artist1",
                     *         "backgroundImage": "",
                     *         "bio": ""
                     *       }
                     *     ]
                     */
                    "application/json": unknown;
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ArtistsController_getById_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Artist ID (UUID) */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": Record<string, never>;
                };
            };
        };
    };
    ArtistsController_updateProfile_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Artist ID (UUID) */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ArtistsController_deleteProfile_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Artist ID (UUID) */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ArtistsController_getByUsername_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Artist username */
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": Record<string, never>;
                };
            };
        };
    };
    TracksController_getAll_v1: {
        parameters: {
            query?: {
                /** @description Page number */
                page?: number;
                /** @description Items per page */
                limit?: number;
                /** @description Search by track title */
                title?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
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
                     *         "createdAt": "2026-02-13T14:18:24.095Z",
                     *         "updatedAt": "2026-02-13T14:18:24.095Z",
                     *         "duration": 180,
                     *         "releaseDate": "2023-10-01T12:00:00.000Z",
                     *         "lyrics": null
                     *       }
                     *     ]
                     */
                    "application/json": unknown;
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TracksController_postTrack_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["CreateTrackDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TrackEntity"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": Record<string, never>;
                };
            };
        };
    };
    TracksController_getById_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": Record<string, never>;
                };
            };
        };
    };
    TracksController_putTrack_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTrackDto"];
            };
        };
        responses: {
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": Record<string, never>;
                };
            };
        };
    };
    TracksController_streamTrack_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PlaylistsController_getAll_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Page number for pagination */
                page: number;
                /** @description Number of items per page */
                limit: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": Record<string, never>[];
                };
            };
        };
    };
    PlaylistsController_post_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreatePlaylistDto"];
            };
        };
        responses: {
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PlaylistsController_getById_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": Record<string, never>;
                };
            };
        };
    };
    PlaylistsController_update_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdatePlaylistDto"];
            };
        };
        responses: {
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AlbumsController_getAllAlbums_v1: {
        parameters: {
            query: {
                page: number;
                limit: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AlbumEntity"][];
                };
            };
        };
    };
    AlbumsController_createAlbum_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAlbumDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AlbumEntity"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AlbumsController_getById_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AlbumEntity"];
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": Record<string, never>;
                };
            };
        };
    };
    AlbumsController_updateAlbum_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAlbumDto"];
            };
        };
        responses: {
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AlbumEntity"];
                };
            };
        };
    };
    AlbumsController_deleteAlbum_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_login_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            /** @description Successfully logged in */
            201: {
                headers: {
                    /** @description HttpOnly cookies: access_token и refresh_token */
                    "Set-Cookie"?: string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation error */
            400: {
                headers: {
                    [name: string]: unknown;
                };
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
                    "application/json": unknown;
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_registration_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegistrationDto"];
            };
        };
        responses: {
            /** @description Successfully registered */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation error */
            400: {
                headers: {
                    [name: string]: unknown;
                };
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
                    "application/json": unknown;
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description User already exists */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_logout_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successfully logged out */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_refresh_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Token refreshed */
            201: {
                headers: {
                    /** @description HttpOnly cookies: access_token */
                    "Set-Cookie"?: string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_getMe_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successfully logged out */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SafeUserEntity"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /**
                         * @example Invalid or expired token
                         * @enum {string}
                         */
                        message?: "Access token required" | "Refresh token required" | "Invalid token requirement" | "Invalid or expired token" | "User not found" | "Session not found";
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Method not allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not implemented */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Gateway timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description HTTP version not supported */
            505: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Insufficient storage */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Loop detected */
            508: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": Record<string, never>;
                };
            };
        };
    };
}
