export const LOGIN_RESPONSE_MESSAGES = {
    LOGGED_IN: 'Logged in successfully',
    USER_NOT_EXIST: 'User does not exist',
    INVALID_PASSWORD: 'Invalid password'
} as const;

export const LOGOUT_RESPONSE_MESSAGES = {
    LOGGED_OUT: 'Logged out successfully',
    INVALID_TOKEN: 'Invalid token',
    REFRESH_TOKEN_REQUIRED: 'Refresh Token required'
} as const;

export const REFRESH_RESPONSE_MESSAGES = {
    SUCCESS: 'New tokens issued successfully',
    
};

export const SIGNUP_RESPONSE_MESSAGES = {
    USER_CREATED: 'User registered successfully',
    INVALID_ROLE: 'Invalid role value',
    USER_ALREADY_EXIST: 'User already exists'
}

export const CREATE_ADMIN_RESPONSE_MESSAGES = {
    ADMIN_CREATED: 'Admin registered successfully',
    USER_ALREADY_EXIST: SIGNUP_RESPONSE_MESSAGES.USER_ALREADY_EXIST
}

export const GET_USER_DETAILS = {
    FETCHED_USER_DETAILS: 'User details fetched successfully'
}