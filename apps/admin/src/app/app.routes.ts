import type { Routes } from '@angular/router'
import { requireStaffSession } from '@shared/api/auth.guard'

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
  { path: '**', redirectTo: '' },
]
