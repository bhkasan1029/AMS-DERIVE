export const COLLECTIONS = {
  USERS: 'users',
  REGISTRATIONS: 'registrations',
} as const;

export const AUTH_ERRORS = {
  INVALID_TOKEN: 'Invalid or expired token',
  MISSING_AUTH: 'Missing or invalid authorization header',
  USER_NOT_FOUND: 'User not found',
} as const;
