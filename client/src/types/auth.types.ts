// src/types/auth.types.ts

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  CLINIC_ADMIN = 'clinic_admin',
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  profileImage?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isActive: boolean;
  lastLogin?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  licenseNumber?: string; // For doctors
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLogin?: string;
}
