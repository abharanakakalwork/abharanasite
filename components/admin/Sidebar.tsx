'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ClipboardList,
  MessageSquare, 
  Music, 
  Palmtree, 
  BookOpen, 
  Settings, 
  LogOut,
  CalendarDays,
  Download,
  Palette,
  Video
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: ClipboardList, label: 'Bookings', href: '/admin/bookings' },
  { icon: MessageSquare, label: 'Messages', href: '/admin/enquiries' },
  { icon: BookOpen, label: 'Yoga Classes', href: '/admin/online-sessions' },
  { icon: Video, label: 'Video Courses', href: '/admin/courses' },
  { icon: Music, label: 'Meditation Audio', href: '/admin/sound-healing' },
  { icon: CalendarDays, label: 'Events', href: '/admin/upcoming-sessions' },
  { icon: Palmtree, label: 'Retreats', href: '/admin/retreats' },
  { icon: BookOpen, label: 'Blog', href: '/admin/within' },
  { icon: Palette, label: 'Site Pages', href: '/admin/pages' },
  { icon: Download, label: 'Files', href: '/admin/downloads' },
  { icon: Settings, label: 'Admin Settings', href: '/admin/settings' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-[#f1e4da] bg-white/40 backdrop-blur-2xl">
      <div className="flex h-full flex-col p-6">
        {/* Logo / Branding */}
        <div className="mb-12 flex items-center space-x-3 px-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#bc6746] to-[#a55a3d] shadow-lg shadow-[#bc6746]/20" />
          <span className="text-xl font-bold tracking-tight text-[#4a3b32]">
            Abharana <span className="text-[#bc6746]">Admin</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "group relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300",
                    isActive 
                      ? "bg-[#bc6746]/10 text-[#bc6746] shadow-sm" 
                      : "text-[#4a3b32]/60 hover:bg-[#bc6746]/5 hover:text-[#bc6746]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#bc6746]/5 to-transparent"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <Icon className={cn(
                    "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                    isActive ? "text-[#bc6746]" : "text-[#4a3b32]/40"
                  )} />
                  
                  <span className="relative z-10 text-sm font-medium tracking-wide">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="mt-auto border-t border-[#f1e4da] pt-6 p-2">
          <button
            className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-[#4a3b32]/40 transition-all duration-300 hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
