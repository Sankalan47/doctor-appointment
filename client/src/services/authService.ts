// src/services/authService.ts
import { apiService } from '../lib/api';
import { AuthResponse, LoginCredentials, RegisterData, UserProfile } from '../types/auth.types';

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await apiService.post<AuthResponse>('/auth/login', { email, password });
    return response;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Login failed';
    throw new Error(message);
  }
};

export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await apiService.post<AuthResponse>('/auth/register', userData);
    return response;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Registration failed';
    throw new Error(message);
  }
};

export const getCurrentUser = async (): Promise<{ success: boolean; user: UserProfile }> => {
  try {
    const response = await apiService.get<{ success: boolean; user: UserProfile }>('/auth/me');
    return response;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to get current user';
    throw new Error(message);
  }
};

export const logoutUser = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiService.post<{ success: boolean; message: string }>('/auth/logout');
    return response;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Logout failed';
    throw new Error(message);
  }
};

export const forgotPassword = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiService.post<{ success: boolean; message: string }>(
      '/auth/forgot-password',
      { email }
    );
    return response;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Password reset request failed';
    throw new Error(message);
  }
};

export const resetPassword = async (
  token: string,
  password: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiService.post<{ success: boolean; message: string }>(
      '/auth/reset-password',
      { token, password }
    );
    return response;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Password reset failed';
    throw new Error(message);
  }
};
