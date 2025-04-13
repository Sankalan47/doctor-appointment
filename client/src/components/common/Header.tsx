// src/components/common/Header/Header.tsx
import { Link } from 'react-router-dom';
import { User as UserIcon, Bell, Settings, LogOut, Calendar, Menu as MenuIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { User } from '@/types/auth.types';
import { useEffect, useState } from 'react';

interface HeaderProps {
  onMenuClick?: () => void;
  user?: User | null;
}

export default function Header({ onMenuClick, user }: HeaderProps) {
  const { logout, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<number>(0);

  // Simulate fetching notifications
  useEffect(() => {
    if (isAuthenticated) {
      // This would be an API call in a real app
      setNotifications(Math.floor(Math.random() * 5));
    }
  }, [isAuthenticated]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Mobile menu button */}
            {onMenuClick && (
              <div className="flex items-center md:hidden">
                <button
                  onClick={onMenuClick}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
              </div>
            )}

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img className="h-8 w-auto" src="/logo.svg" alt="MediConnect" />
                <span className="ml-2 text-xl font-bold text-primary">MediConnect</span>
              </Link>
            </div>

            {/* Main nav - desktop */}
            <nav className="hidden md:ml-6 md:flex md:space-x-4 items-center">
              <Link
                to="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary"
              >
                Home
              </Link>
              <Link
                to="/doctors"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary"
              >
                Find Doctors
              </Link>
              <Link
                to="/about"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary"
              >
                Contact
              </Link>
            </nav>
          </div>

          <div className="flex items-center">
            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-full text-gray-500 hover:text-primary focus:outline-none relative">
                        <Bell className="h-6 w-6" />
                        {notifications > 0 && (
                          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-xs text-white text-center">
                            {notifications}
                          </span>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {notifications > 0 ? (
                        Array(notifications)
                          .fill(0)
                          .map((_, i) => (
                            <DropdownMenuItem key={i}>
                              <span className="text-sm">
                                {i === 0
                                  ? 'Appointment reminder: Tomorrow at 10:00 AM'
                                  : i === 1
                                  ? 'New message from Dr. Smith'
                                  : `Notification ${i + 1}`}
                              </span>
                            </DropdownMenuItem>
                          ))
                      ) : (
                        <DropdownMenuItem>
                          <span className="text-sm text-gray-500">No new notifications</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* User dropdown */}
                <div className="ml-3 relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center text-sm rounded-full focus:outline-none">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.profileImage}
                            alt={`${user.firstName} ${user.lastName}`}
                          />
                          <AvatarFallback>
                            {getInitials(`${user.firstName} ${user.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* Dashboard link based on role */}
                      <DropdownMenuItem asChild>
                        <Link to={`/dashboard/${user.role.toLowerCase()}`}>
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/profile">
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
