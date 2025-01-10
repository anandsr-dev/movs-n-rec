export const ACCESS_TOKEN_EXPIRY = '10m';
export const REFRESH_TOKEN_EXPIRY = '1d';
export const REFRESH_COOKIE_KEY = 'refreshToken';
export const RoleEnum = {
    USER: 'user',
    ADMIN: 'admin',
    SUPERADMIN: 'superadmin'
} as const;
export const GenderEnum = {
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other'
} as const;
export const AccessLevel = {
    user: 1,
    admin: 2,
    superadmin: 3
} as const;