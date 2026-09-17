import type { Routes } from '@angular/router'
import { requirePermission, requireStaffSession } from '@presentation/guards'

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Overview · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('overview:read')],
    loadComponent: () =>
      import('@presentation/pages/overview/overview').then((m) => m.OverviewPage),
  },
  {
    path: 'login',
    title: 'Sign in · Bitrate operators',
    loadComponent: () => import('@presentation/pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'no-access',
    title: 'No access · Bitrate operators',
    canActivate: [requireStaffSession],
    loadComponent: () =>
      import('@presentation/pages/no-access/no-access').then((m) => m.NoAccessPage),
  },
  {
    path: 'moderation',
    title: 'Moderation queue · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('reports:read')],
    loadComponent: () =>
      import('@presentation/pages/moderation/moderation').then((m) => m.ModerationQueue),
  },
  {
    path: 'moderation/:id',
    title: 'Report · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('reports:read')],
    loadComponent: () =>
      import('@presentation/pages/moderation/report-detail').then((m) => m.ReportDetailPage),
  },
  {
    path: 'catalog',
    title: 'Catalog pipeline · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('tracks:read')],
    loadComponent: () => import('@presentation/pages/catalog/catalog').then((m) => m.CatalogPage),
  },
  {
    path: 'catalog/:id',
    title: 'Track · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('tracks:read')],
    loadComponent: () =>
      import('@presentation/pages/catalog/track-detail').then((m) => m.TrackDetailPage),
  },
  {
    path: 'artists',
    title: 'Artists · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('artists:read')],
    loadComponent: () => import('@presentation/pages/artists/artists').then((m) => m.ArtistsPage),
  },
  {
    path: 'artists/:id',
    title: 'Artist · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('artists:read')],
    loadComponent: () =>
      import('@presentation/pages/artists/artist-detail').then((m) => m.ArtistDetailPage),
  },
  {
    path: 'users',
    title: 'Listeners · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('users:read')],
    loadComponent: () => import('@presentation/pages/users/users').then((m) => m.UsersPage),
  },
  {
    path: 'users/:id',
    title: 'Listener · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('users:read')],
    loadComponent: () =>
      import('@presentation/pages/users/user-detail').then((m) => m.UserDetailPage),
  },
  {
    path: 'audit',
    title: 'Audit log · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('audit:read')],
    loadComponent: () => import('@presentation/pages/audit/audit').then((m) => m.AuditPage),
  },
  {
    path: 'roles',
    title: 'Roles · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('roles:read')],
    loadComponent: () => import('@presentation/pages/roles/roles').then((m) => m.RolesPage),
  },
  {
    path: 'roles/new',
    title: 'New role · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('roles:write')],
    loadComponent: () =>
      import('@presentation/pages/roles/role-editor').then((m) => m.RoleEditorPage),
  },
  {
    path: 'roles/:id',
    title: 'Edit role · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('roles:read')],
    loadComponent: () =>
      import('@presentation/pages/roles/role-editor').then((m) => m.RoleEditorPage),
  },
  {
    path: 'staff',
    title: 'Staff · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('staff:read')],
    loadComponent: () => import('@presentation/pages/staff/staff').then((m) => m.StaffPage),
  },
  {
    path: 'staff/new',
    title: 'New operator · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('staff:write')],
    loadComponent: () =>
      import('@presentation/pages/staff/staff-create').then((m) => m.StaffCreatePage),
  },
  {
    path: 'staff/:id',
    title: 'Operator · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('staff:read')],
    loadComponent: () =>
      import('@presentation/pages/staff/staff-detail').then((m) => m.StaffDetailPage),
  },
  { path: '**', redirectTo: '' },
]
