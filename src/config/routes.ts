// Centralized Application Route Definitions
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  DISCLAIMER: '/disclaimer',
  DESCRIBE: '/describe',
  CONFIRM_PROFILE: '/confirm-profile',
  RESULTS: '/results',
  SCHEME_DETAIL: (schemeId: string = ':schemeId') => `/schemes/${schemeId}`,
  DOCUMENT_CHECKLIST: (schemeId: string = ':schemeId') => `/schemes/${schemeId}/documents`,
  APPLICATION_GUIDE: (schemeId: string = ':schemeId') => `/schemes/${schemeId}/apply`,
  ADMIN: '/admin',
  ADMIN_SCHEME_EDIT: (schemeId: string = ':schemeId') => `/admin/schemes/${schemeId}`,
  ADMIN_AUDIT_LOG: '/admin/audit-log',
  NOT_AUTHORIZED: '/not-authorized',
  NOT_FOUND: '*',
} as const;
