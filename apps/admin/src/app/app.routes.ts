import type { Routes } from '@angular/router'
import { requirePermission, requireStaffSession } from '@presentation/guards'

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'moderation' },
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
    path: 'catalog',
    title: 'Catalog pipeline · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('tracks:read')],
    loadComponent: () => import('@presentation/pages/catalog/catalog').then((m) => m.CatalogPage),
  },
  {
    path: 'artists',
    title: 'Artists · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('artists:read')],
    loadComponent: () => import('@presentation/pages/artists/artists').then((m) => m.ArtistsPage),
  },
  {
    path: 'users',
    title: 'Listeners · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('users:read')],
    loadComponent: () => import('@presentation/pages/users/users').then((m) => m.UsersPage),
  },
  {
    path: 'audit',
    title: 'Audit log · Bitrate operators',
    canActivate: [requireStaffSession, requirePermission('audit:read')],
    loadComponent: () => import('@presentation/pages/audit/audit').then((m) => m.AuditPage),
  },
  { path: '**', redirectTo: '' },
]
