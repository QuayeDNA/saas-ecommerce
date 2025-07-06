import axios from 'axios';
import Cookies from 'js-cookie';
import { getToken, removeToken } from './auth-storage';

// Create a custom axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Add a request interceptor to inject the auth token
apiClient.interceptors.request.use(
  (config) => {
    // First try to get token from cookie (matches auth.service.ts)
    let token = Cookies.get('authToken');
    
    // If not found, fall back to getToken from auth-storage
    if (!token) {
      token = getToken();
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If we get a 401 and haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt token refresh
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/auth/refresh`,
            { refreshToken },
            { withCredentials: true }
          );
          
          const { accessToken } = refreshResponse.data;
          
          // Store new token
          Cookies.set('authToken', accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Only remove token and redirect if refresh actually failed
        removeToken();
        Cookies.remove('authToken');
        Cookies.remove('refreshToken');
        
        // Use custom event instead of direct redirect
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(error);
      }
    }
    
    // If refresh failed or another error occurred
    if (error.response?.status === 401) {
      // Don't redirect here, just clean up tokens and dispatch event
      removeToken();
      Cookies.remove('authToken');
      Cookies.remove('refreshToken');
      
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    
    return Promise.reject(error);
  }
);
