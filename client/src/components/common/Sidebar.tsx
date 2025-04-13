// src/components/common/Sidebar/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import {
  X,
  Home,
  Calendar,
  Users,
  FileText,
  CreditCard,
  Settings,
  BarChart,
  User,
  Stethoscope,
  Building,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/auth.types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

export default function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const location = useLocation();

  // Define navigation items with role-based access
  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: `/dashboard/${userRole.toLowerCase()}`,
      icon: <Home className="h-5 w-5" />,
      roles: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN, UserRole.CLINIC_ADMIN],
    },
    {
      title: 'Appointments',
      href: '/appointments',
      icon: <Calendar className="h-5 w-5" />,
      roles: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN, UserRole.CLINIC_ADMIN],
    },
    {
      title: 'My Doctors',
      href: '/my-doctors',
      icon: <Stethoscope className="h-5 w-5" />,
      roles: [UserRole.PATIENT],
    },
    {
      title: 'My Patients',
      href: '/my-patients',
      icon: <Users className="h-5 w-5" />,
      roles: [UserRole.DOCTOR],
    },
    {
      title: 'Prescriptions',
      href: '/prescriptions',
      icon: <FileText className="h-5 w-5" />,
      roles: [UserRole.PATIENT, UserRole.DOCTOR],
    },
    {
      title: 'Payments',
      href: '/payments',
      icon: <CreditCard className="h-5 w-5" />,
      roles: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN],
    },
    {
      title: 'Consultations',
      href: '/consultations',
      icon: <Stethoscope className="h-5 w-5" />,
      roles: [UserRole.PATIENT, UserRole.DOCTOR],
    },
    {
      title: 'Reviews',
      href: '/reviews',
      icon: <Star className="h-5 w-5" />,
      roles: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN],
    },
    {
      title: 'My Clinics',
      href: '/clinics',
      icon: <Building className="h-5 w-5" />,
      roles: [UserRole.DOCTOR, UserRole.CLINIC_ADMIN],
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: <BarChart className="h-5 w-5" />,
      roles: [UserRole.DOCTOR, UserRole.ADMIN, UserRole.CLINIC_ADMIN],
    },
    {
      title: 'User Management',
      href: '/users',
      icon: <Users className="h-5 w-5" />,
      roles: [UserRole.ADMIN],
    },
    {
      title: 'Doctor Applications',
      href: '/doctor-applications',
      icon: <Stethoscope className="h-5 w-5" />,
      roles: [UserRole.ADMIN],
    },
    {
      title: 'Clinic Management',
      href: '/clinic-management',
      icon: <Building className="h-5 w-5" />,
      roles: [UserRole.ADMIN],
    },
    {
      title: 'Profile',
      href: '/profile',
      icon: <User className="h-5 w-5" />,
      roles: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN, UserRole.CLINIC_ADMIN],
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
      roles: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN, UserRole.CLINIC_ADMIN],
    },
  ];

  // Filter items based on user role
  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  // Mobile sidebar overlay
  const mobileSidebarClasses = cn(
    'fixed inset-0 flex z-40 md:hidden',
    isOpen ? 'translate-x-0' : '-translate-x-full'
  );

  // Desktop sidebar
  const desktopSidebarClasses = cn('hidden md:flex md:flex-shrink-0');

  // Sidebar content - shared between mobile and desktop
  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      {/* Logo area */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
        <Link to="/" className="flex items-center">
          <img className="h-8 w-auto" src="/logo.svg" alt="MediConnect" />
          <span className="ml-2 text-xl font-bold text-primary">MediConnect</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {filteredNavItems.map(item => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md group transition-colors',
                  isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <div
                  className={cn(
                    'mr-3',
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                  )}
                >
                  {item.icon}
                </div>
                {item.title}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User role indicator */}
      <div className="border-t border-gray-200 p-4">
        <div className="px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-600 uppercase tracking-wider">
          {userRole} Account
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <div className={mobileSidebarClasses}>
        {/* Backdrop */}
        {isOpen && <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />}

        {/* Sidebar */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full transition-transform ease-in-out duration-300">
          {sidebarContent}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={desktopSidebarClasses}>{sidebarContent}</div>
    </>
  );
}
