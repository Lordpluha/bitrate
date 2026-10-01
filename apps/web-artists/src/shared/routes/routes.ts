export const ROUTES = {
  landing: '/',
  auth: {
    login: '/login',
    registration: '/registration',
    forgotPassword: '/forgot-password',
  },
  main: '/',
  legal: (slug: string) => `/legal/${slug}`,
  terms: '/legal/terms',
  artistAgreement: '/legal/artist-agreement',
  privacy: '/legal/privacy',
  community: '/legal/community',
  copyright: '/legal/copyright',
  download: '#download',
  plans: '#plans',
  forStudents: '#for-students',
} as const
