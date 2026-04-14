'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  noPadding?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'static';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  delay = 0, 
  noPadding = false,
  onClick,
  variant = 'default'
}) => {
  const isStatic = variant === 'static';

  const cardClasses = cn(
    "relative rounded-2xl border border-[#f1e4da] transition-all duration-300 group overflow-hidden",
    isStatic 
      ? "bg-white/95 shadow-sm hover:shadow-md hover:border-[#bc6746]/30" 
      : "bg-white/60 backdrop-blur-xl shadow-sm shadow-[#4a3b32]/5 hover:border-[#bc6746]/30 hover:bg-white/80 hover:shadow-md",
    !noPadding && "p-6",
    className
  );

  if (isStatic) {
    return (
      <div 
        onClick={onClick}
        className={cardClasses}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={onClick ? { y: -5, transition: { duration: 0.2 } } : {}}
      className={cardClasses}
    >
      {/* Decorative Glow - Only for default variant */}
      <div className="absolute -left-full top-0 h-full w-full bg-gradient-to-r from-transparent via-[#bc6746]/5 to-transparent transition-all duration-1000 group-hover:left-full" />
      
      {children}
    </motion.div>
  );
};
