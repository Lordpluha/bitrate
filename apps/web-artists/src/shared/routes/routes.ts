export const ROUTES = {
  landing: '/',
  auth: {
    login: '/login',
    registration: '/registration',
    verifyEmail: '/verify-email',
    forgotPassword: '/forgot-password',
  },
  dashboard: {
    home: '/dashboard',
    music: '/dashboard/music',
    tasks: '/dashboard/tasks',
    distribution: '/dashboard/distribution',
  },
  main: '/',
  terms: '#terms',
  privacy: '#privacy',
  download: '#download',
  plans: '#plans',
  forStudents: '#for-students',
} as const
