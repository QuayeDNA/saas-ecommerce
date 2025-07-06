import Cookies from 'js-cookie';

// Cookie keys - ensure these match the cookie names used in auth.service.ts
const TOKEN_KEY = 'authToken'; // Changed from 'auth_token' to match auth.service.ts
const USER_KEY = 'user'; // Changed from 'auth_user' to match auth.service.ts
const REFRESH_TOKEN_KEY = 'refreshToken'; // Changed from 'refresh_token' to match auth.service.ts

// Get token from cookies
export const getToken = (): string | undefined => {
    return Cookies.get(TOKEN_KEY);
};

// Set token in cookies
export const setToken = (token: string): void => {
    Cookies.set(TOKEN_KEY, token);
};

// Remove token from cookies
export const removeToken = (): void => {
    Cookies.remove(TOKEN_KEY);
};

// Get user from cookies
export const getUser = (): unknown => {
    const userStr = Cookies.get(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
};

// Set user in cookies
export const setUser = (user: unknown): void => {
    Cookies.set(USER_KEY, JSON.stringify(user));
};

// Remove user from cookies
export const removeUser = (): void => {
    Cookies.remove(USER_KEY);
};

// Get refresh token from cookies
export const getRefreshToken = (): string | undefined => {
    return Cookies.get(REFRESH_TOKEN_KEY);
};

// Set refresh token in cookies
export const setRefreshToken = (token: string): void => {
    Cookies.set(REFRESH_TOKEN_KEY, token);
};

// Remove refresh token from cookies
export const removeRefreshToken = (): void => {
    Cookies.remove(REFRESH_TOKEN_KEY);
};

// Clear all auth data from cookies
export const clearAuthData = (): void => {
    removeToken();
    removeUser();
    removeRefreshToken();
    
    // Also remove any remember-me cookie
    Cookies.remove('rememberMe');
};
