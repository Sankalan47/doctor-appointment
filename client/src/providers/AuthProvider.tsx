// src/providers/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types/auth.types';
import { loginUser, registerUser, getCurrentUser, logoutUser } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const isAuthenticated = !!token && !!user;

  // Check if user is authenticated on mount
  useEffect(() => {
    const initialize = async () => {
      if (token) {
        try {
          await checkAuth();
        } catch (error) {
          console.error('Authentication error:', error);
          handleLogout();
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await getCurrentUser();
      if (response.success) {
        setUser(response.user);
        return true;
      } else {
        handleLogout();
        return false;
      }
    } catch (error) {
      handleLogout();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginUser(email, password);
      if (response.success) {
        setUser(response.user);
        setToken(response.accessToken);
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);

        // Redirect based on user role
        if (response.user.role === UserRole.PATIENT) {
          navigate('/dashboard/patient');
        } else if (response.user.role === UserRole.DOCTOR) {
          navigate('/dashboard/doctor');
        } else if (response.user.role === UserRole.ADMIN) {
          navigate('/dashboard/admin');
        } else if (response.user.role === UserRole.CLINIC_ADMIN) {
          navigate('/dashboard/clinic');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await registerUser(userData);
      if (response.success) {
        setUser(response.user);
        setToken(response.accessToken);
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);

        // Redirect to appropriate dashboard or onboarding
        if (response.user.role === UserRole.PATIENT) {
          navigate('/dashboard/patient');
        } else if (response.user.role === UserRole.DOCTOR) {
          navigate('/doctor/onboarding');
        }
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    checkAuth,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
