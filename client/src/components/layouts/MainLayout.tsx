// src/components/layouts/MainLayout/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { useAuth } from '@/providers/AuthProvider';

export default function MainLayout() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header user={user} />

      {/* Main content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
