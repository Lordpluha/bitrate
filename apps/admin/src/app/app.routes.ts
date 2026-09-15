import type { Routes } from '@angular/router'
import { requireStaffSession } from '@presentation/guards'

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'moderation' },
  {
    path: 'login',
    title: 'Sign in · Bitrate operators',
    loadComponent: () => import('@presentation/pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'moderation',
    title: 'Moderation queue · Bitrate operators',
    canActivate: [requireStaffSession],
    loadComponent: () =>
      import('@presentation/pages/moderation/moderation').then((m) => m.ModerationQueue),
  },
  {
    path: 'catalog',
    title: 'Catalog pipeline · Bitrate operators',
    canActivate: [requireStaffSession],
    loadComponent: () => import('@presentation/pages/catalog/catalog').then((m) => m.CatalogPage),
  },
  {
    path: 'artists',
    title: 'Artists · Bitrate operators',
    canActivate: [requireStaffSession],
    loadComponent: () => import('@presentation/pages/artists/artists').then((m) => m.ArtistsPage),
  },
  {
    path: 'users',
    title: 'Listeners · Bitrate operators',
    canActivate: [requireStaffSession],
    loadComponent: () => import('@presentation/pages/users/users').then((m) => m.UsersPage),
  },
  {
    path: 'audit',
    title: 'Audit log · Bitrate operators',
    canActivate: [requireStaffSession],
    loadComponent: () => import('@presentation/pages/audit/audit').then((m) => m.AuditPage),
  },
  { path: '**', redirectTo: '' },
]
