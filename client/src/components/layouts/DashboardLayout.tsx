// src/components/layouts/DashboardLayout/DashboardLayout.tsx
import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import Sidebar from '../../common/Sidebar/Sidebar';
import Header from '../../common/Header/Header';
import { UserRole } from '@/types/auth.types';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout() {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthed = await checkAuth();
      if (!isAuthed) {
        navigate('/login');
      }
    };

    verifyAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will navigate to login from useEffect
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user.role} />

      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} user={user} />

        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 md:px-8">
            {/* Role-specific welcome banner */}
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                {user.role === UserRole.PATIENT && 'Patient Dashboard'}
                {user.role === UserRole.DOCTOR && 'Doctor Dashboard'}
                {user.role === UserRole.ADMIN && 'Admin Dashboard'}
                {user.role === UserRole.CLINIC_ADMIN && 'Clinic Management'}
              </h1>
              <p className="mt-1 text-gray-500">
                Welcome back, {user.firstName} {user.lastName}
              </p>
            </div>

            {/* Page content */}
            <div className="mb-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
