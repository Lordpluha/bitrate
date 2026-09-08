import type { Routes } from '@angular/router'
import { requireStaffSession } from '@shared/api/auth.guard'

/** Order matches how an operator's day runs: triage first, then the surfaces it points at. */
export const NAV_ITEMS = [
  { path: '/moderation', label: 'Moderation queue' },
  { path: '/catalog', label: 'Catalog pipeline' },
  { path: '/artists', label: 'Artists' },
  { path: '/users', label: 'Listeners' },
  { path: '/audit', label: 'Audit log' },
] as const

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'moderation' },
  {
    path: 'login',
    title: 'Sign in · Bitrate operators',
    loadComponent: () => import('@features/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'moderation',
    title: 'Moderation queue · Bitrate operators',
    canActivate: [requireStaffSession],
    loadComponent: () => import('@features/moderation/moderation').then((m) => m.ModerationQueue),
  },
  {
    path: 'catalog',
    title: 'Catalog pipeline · Bitrate operators',
    canActivate: [requireStaffSession],
    loadComponent: () => import('@features/catalog/catalog').then((m) => m.CatalogPage),
  },
  {
    path: 'artists',
    title: 'Artists · Bitrate operators',
    canActivate: [requireStaffSession],
    loadComponent: () => import('@features/artists/artists').then((m) => m.ArtistsPage),
  },
  {
    path: 'users',
    title: 'Listeners · Bitrate operators',
    canActivate: [requireStaffSession],
    loadComponent: () => import('@features/users/users').then((m) => m.UsersPage),
  },
  {
    path: 'audit',
    title: 'Audit log · Bitrate operators',
    canActivate: [requireStaffSession],
    loadComponent: () => import('@features/audit/audit').then((m) => m.AuditPage),
  },
  { path: '**', redirectTo: '' },
]
