import { inject } from '@angular/core'
import { Router, type Routes } from '@angular/router'
import { requirePermission, requireStaffSession } from '@presentation/guards'
import { CRUMB_DATA_KEY } from '@presentation/navigation'

/** Titles are bare names; `OperatorTitleStrategy` appends the panel suffix. */
export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign in',
    loadComponent: () => import('@presentation/pages/login/login').then((m) => m.LoginPage),
  },
  {
    // Every screen but sign-in needs a staff session; each child adds its own permission.
    path: '',
    canActivateChild: [requireStaffSession],
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Overview',
        canActivate: [requirePermission('overview:read')],
        loadComponent: () =>
          import('@presentation/pages/overview/overview').then((m) => m.OverviewPage),
      },
      {
        // The old drill-down is now Overview's "Reports by type" panel; old links open it there.
        path: 'overview/reports',
        redirectTo: ({ queryParams }) =>
          inject(Router).createUrlTree(['/'], {
            queryParams: { ...queryParams, panel: 'reports' },
          }),
      },
      {
        path: 'no-access',
        title: 'No access',
        loadComponent: () =>
          import('@presentation/pages/no-access/no-access').then((m) => m.NoAccessPage),
      },
      {
        path: 'moderation',
        title: 'Moderation queue',
        canActivate: [requirePermission('reports:read')],
        loadComponent: () =>
          import('@presentation/pages/moderation/moderation').then((m) => m.ModerationQueue),
      },
      {
        path: 'moderation/:id',
        title: 'Report',
        canActivate: [requirePermission('reports:read')],
        loadComponent: () =>
          import('@presentation/pages/moderation/report-detail').then((m) => m.ReportDetailPage),
      },
      {
        path: 'catalog',
        title: 'Catalog pipeline',
        canActivate: [requirePermission('tracks:read')],
        loadComponent: () =>
          import('@presentation/pages/catalog/catalog').then((m) => m.CatalogPage),
      },
      {
        path: 'catalog/:id',
        title: 'Track',
        canActivate: [requirePermission('tracks:read')],
        loadComponent: () =>
          import('@presentation/pages/catalog/track-detail').then((m) => m.TrackDetailPage),
      },
      {
        path: 'albums',
        title: 'Albums',
        canActivate: [requirePermission('albums:read')],
        loadComponent: () => import('@presentation/pages/albums/albums').then((m) => m.AlbumsPage),
      },
      {
        path: 'albums/:id',
        title: 'Album',
        canActivate: [requirePermission('albums:read')],
        loadComponent: () =>
          import('@presentation/pages/albums/album-detail').then((m) => m.AlbumDetailPage),
      },
      {
        path: 'releases',
        title: 'Release review',
        canActivate: [requirePermission('releases:read')],
        loadComponent: () =>
          import('@presentation/pages/release-review/release-queue').then(
            (m) => m.ReleaseQueuePage,
          ),
      },
      {
        path: 'releases/:id',
        title: 'Release',
        canActivate: [requirePermission('releases:read')],
        loadComponent: () =>
          import('@presentation/pages/release-review/release-review-detail').then(
            (m) => m.ReleaseReviewDetailPage,
          ),
      },
      {
        path: 'playlists',
        title: 'Playlists',
        canActivate: [requirePermission('playlists:read')],
        loadComponent: () =>
          import('@presentation/pages/playlists/playlists').then((m) => m.PlaylistsPage),
      },
      {
        path: 'playlists/:id',
        title: 'Playlist',
        canActivate: [requirePermission('playlists:read')],
        loadComponent: () =>
          import('@presentation/pages/playlists/playlist-detail').then((m) => m.PlaylistDetailPage),
      },
      {
        path: 'podcasts',
        title: 'Podcasts',
        canActivate: [requirePermission('podcasts:read')],
        loadComponent: () =>
          import('@presentation/pages/podcasts/podcasts').then((m) => m.PodcastsPage),
      },
      {
        path: 'podcasts/:id',
        title: 'Podcast',
        canActivate: [requirePermission('podcasts:read')],
        loadComponent: () =>
          import('@presentation/pages/podcasts/podcast-detail').then((m) => m.PodcastDetailPage),
      },
      {
        path: 'genres',
        title: 'Genres',
        canActivate: [requirePermission('genres:read')],
        loadComponent: () => import('@presentation/pages/genres/genres').then((m) => m.GenresPage),
      },
      {
        path: 'genres/new',
        title: 'New genre',
        canActivate: [requirePermission('genres:write')],
        loadComponent: () =>
          import('@presentation/pages/genres/genre-editor').then((m) => m.GenreEditorPage),
      },
      {
        path: 'genres/:id',
        title: 'Edit genre',
        canActivate: [requirePermission('genres:read')],
        loadComponent: () =>
          import('@presentation/pages/genres/genre-editor').then((m) => m.GenreEditorPage),
      },
      {
        path: 'artists',
        title: 'Artists',
        canActivate: [requirePermission('artists:read')],
        loadComponent: () =>
          import('@presentation/pages/artists/artists').then((m) => m.ArtistsPage),
      },
      {
        path: 'artists/:id',
        title: 'Artist',
        canActivate: [requirePermission('artists:read')],
        loadComponent: () =>
          import('@presentation/pages/artists/artist-detail').then((m) => m.ArtistDetailPage),
      },
      {
        path: 'users',
        title: 'Listeners',
        canActivate: [requirePermission('users:read')],
        loadComponent: () => import('@presentation/pages/users/users').then((m) => m.UsersPage),
      },
      {
        path: 'users/:id',
        title: 'Listener',
        canActivate: [requirePermission('users:read')],
        loadComponent: () =>
          import('@presentation/pages/users/user-detail').then((m) => m.UserDetailPage),
      },
      {
        path: 'audit',
        title: 'Audit log',
        canActivate: [requirePermission('audit:read')],
        loadComponent: () => import('@presentation/pages/audit/audit').then((m) => m.AuditPage),
      },
      {
        path: 'roles',
        title: 'Roles',
        canActivate: [requirePermission('roles:read')],
        loadComponent: () => import('@presentation/pages/roles/roles').then((m) => m.RolesPage),
      },
      {
        path: 'roles/new',
        title: 'New role',
        canActivate: [requirePermission('roles:write')],
        loadComponent: () =>
          import('@presentation/pages/roles/role-editor').then((m) => m.RoleEditorPage),
      },
      {
        path: 'roles/:id',
        title: 'Edit role',
        canActivate: [requirePermission('roles:read')],
        loadComponent: () =>
          import('@presentation/pages/roles/role-editor').then((m) => m.RoleEditorPage),
      },
      {
        path: 'staff',
        title: 'Staff',
        canActivate: [requirePermission('staff:read')],
        loadComponent: () => import('@presentation/pages/staff/staff').then((m) => m.StaffPage),
      },
      {
        path: 'staff/new',
        title: 'New operator',
        canActivate: [requirePermission('staff:write')],
        loadComponent: () =>
          import('@presentation/pages/staff/staff-create').then((m) => m.StaffCreatePage),
      },
      {
        path: 'staff/:id',
        title: 'Operator',
        canActivate: [requirePermission('staff:read')],
        loadComponent: () =>
          import('@presentation/pages/staff/staff-detail').then((m) => m.StaffDetailPage),
      },
      {
        // Any address the console does not know: its own page inside the shell, not a silent
        // redirect to `/` that hid typos and stale links. Under the staff guard like every
        // child — signed out, the operator is sent to sign in first.
        path: '**',
        title: 'Not found',
        data: { [CRUMB_DATA_KEY]: 'notFound.crumb' },
        loadComponent: () =>
          import('@presentation/pages/not-found/not-found').then((m) => m.NotFoundPage),
      },
    ],
  },
]
