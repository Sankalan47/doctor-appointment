// src/components/layouts/AuthLayout/AuthLayout.tsx
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/auth.types';

export default function AuthLayout() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to appropriate dashboard based on role
      if (user.role === UserRole.PATIENT) {
        navigate('/dashboard/patient');
      } else if (user.role === UserRole.DOCTOR) {
        navigate('/dashboard/doctor');
      } else if (user.role === UserRole.ADMIN) {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/">
          <img className="mx-auto h-16 w-auto" src="/logo.svg" alt="MediConnect Logo" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">MediConnect</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Your trusted healthcare connection</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} MediConnect. All rights reserved.
        </p>
      </div>
    </div>
  );
}
