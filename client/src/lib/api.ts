// src/lib/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Create axios instance with base config
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // If the error is due to an expired token and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // No refresh token, force logout
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh-token`,
          { refreshToken }
        );

        if (response.data.success) {
          // Update tokens
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          // Refresh failed, force logout
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Force logout on any refresh error
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Utility methods for common requests
export const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    api.get<T>(url, config).then(response => response.data),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    api.post<T>(url, data, config).then(response => response.data),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    api.put<T>(url, data, config).then(response => response.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    api.delete<T>(url, config).then(response => response.data),
};

export default api;
