export const ROUTES = {
  landing: '/',
  auth: {
    login: '/auth/login',
    registration: '/auth/registration',
    forgotPassword: '/auth/forgot-password',
  },
  main: '/main',
  terms: '#terms',
  privacy: '#privacy',
  download: '#download',
  plans: '#plans',
  forStudents: '#for-students',
} as const;
