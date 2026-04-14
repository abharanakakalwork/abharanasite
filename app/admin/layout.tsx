'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { CosmicBackground } from '@/components/admin/CosmicBackground';
import { Sidebar } from '@/components/admin/Sidebar';
import { useAudio } from '@/context/AudioContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pauseBgAudio } = useAudio();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  React.useEffect(() => {
    // Automatically pause background music when in admin panel
    pauseBgAudio();
  }, [pauseBgAudio]);

  return (
    <AdminAuthProvider>
      <CosmicBackground>
        {!isLoginPage && <Sidebar />}
        
        <main className={!isLoginPage ? "flex-1 ml-64 p-8 transition-all duration-500" : "flex-1"}>
          {children}
        </main>
        
        <ToastContainer
          position="bottom-right"
          theme="light"
          toastStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid #f1e4da', color: '#4a3b32' }}
        />
      </CosmicBackground>
    </AdminAuthProvider>
  );
}
