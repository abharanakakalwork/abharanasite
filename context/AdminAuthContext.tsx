'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/api/client';
import { toast } from 'react-toastify';

interface AdminUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for existing token on mount
    const checkAuth = () => {
      const token = localStorage.getItem('admin_token');
      const savedUser = localStorage.getItem('admin_user');
      
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      } else if (!pathname.includes('/admin/login')) {
        // Redirect to login if no token found and not on login page
        router.push('/admin/login');
      }
      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  const login = async (credentials: any) => {
    try {
      const response = await authService.login(credentials);
      const { token, admin } = response.data;

      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(admin));
      
      setUser(admin);
      toast.success('Welcome back, Admin');
      router.push('/admin');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout().catch(() => {}); // Attempt API logout
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setUser(null);
      router.push('/admin/login');
      toast.info('Logged out securely');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
