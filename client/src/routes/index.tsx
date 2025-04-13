// src/routes/index.tsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Suspense, lazy } from 'react';

// Layouts
import AuthLayout from '@/components/layouts/AuthLayout';
import MainLayout from '@/components/layouts/MainLayout';
import DashboardLayout from '@/components/layouts/DashboardLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

// Lazy loaded pages
const HomePage = lazy(() => import('@/pages/home/HomePage'));
const DoctorsPage = lazy(() => import('@/pages/doctors/DoctorsPage'));
const DoctorDetailsPage = lazy(() => import('@/pages/doctors/DoctorDetailsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Dashboard Pages
const PatientDashboardPage = lazy(() => import('@/pages/dashboard/patient/PatientDashboardPage'));
const DoctorDashboardPage = lazy(() => import('@/pages/dashboard/doctor/DoctorDashboardPage'));
const AdminDashboardPage = lazy(() => import('@/pages/dashboard/admin/AdminDashboardPage'));
const AppointmentsPage = lazy(() => import('@/pages/appointments/AppointmentsPage'));
const AppointmentDetailsPage = lazy(() => import('@/pages/appointments/AppointmentDetailsPage'));
const BookAppointmentPage = lazy(() => import('@/pages/appointments/BookAppointmentPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Role-based route component
const RoleRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return <Navigate to="/unauthorized" replace />;
};

// Router configuration
const createRouter = () => {
  return createBrowserRouter([
    // Public Routes
    {
      path: '/',
      element: <MainLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <HomePage />
            </Suspense>
          ),
        },
        {
          path: 'doctors',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <DoctorsPage />
            </Suspense>
          ),
        },
        {
          path: 'doctors/:id',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <DoctorDetailsPage />
            </Suspense>
          ),
        },
        {
          path: 'appointment/book/:doctorId',
          element: (
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <BookAppointmentPage />
              </Suspense>
            </ProtectedRoute>
          ),
        },
      ],
    },

    // Auth Routes
    {
      path: '/',
      element: <AuthLayout />,
      children: [
        {
          path: 'login',
          element: <LoginPage />,
        },
        {
          path: 'register',
          element: <RegisterPage />,
        },
        {
          path: 'forgot-password',
          element: <ForgotPasswordPage />,
        },
      ],
    },

    // Dashboard Routes
    {
      path: '/dashboard',
      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard/patient" replace />,
        },
        {
          path: 'patient',
          element: (
            <RoleRoute allowedRoles={['patient']}>
              <Suspense fallback={<LoadingFallback />}>
                <PatientDashboardPage />
              </Suspense>
            </RoleRoute>
          ),
        },
        {
          path: 'doctor',
          element: (
            <RoleRoute allowedRoles={['doctor']}>
              <Suspense fallback={<LoadingFallback />}>
                <DoctorDashboardPage />
              </Suspense>
            </RoleRoute>
          ),
        },
        {
          path: 'admin',
          element: (
            <RoleRoute allowedRoles={['admin']}>
              <Suspense fallback={<LoadingFallback />}>
                <AdminDashboardPage />
              </Suspense>
            </RoleRoute>
          ),
        },
      ],
    },

    // Protected Common Routes
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: 'appointments',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <AppointmentsPage />
            </Suspense>
          ),
        },
        {
          path: 'appointments/:id',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <AppointmentDetailsPage />
            </Suspense>
          ),
        },
        {
          path: 'profile',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <ProfilePage />
            </Suspense>
          ),
        },
        {
          path: 'settings',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <SettingsPage />
            </Suspense>
          ),
        },
      ],
    },

    // 404 Route
    {
      path: '*',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <NotFoundPage />
        </Suspense>
      ),
    },
  ]);
};

export default function AppRoutes() {
  const router = createRouter();
  return <RouterProvider router={router} />;
}
