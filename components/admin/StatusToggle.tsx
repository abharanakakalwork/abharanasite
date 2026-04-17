"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';

interface StatusToggleProps {
  status: boolean;
  onToggle: (newStatus: boolean) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  labels?: { true: string; false: string };
}

export const StatusToggle = ({ 
  status, 
  onToggle, 
  loading = false, 
  disabled = false,
  labels = { true: 'Live', false: 'Draft' }
}: StatusToggleProps) => {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!loading && !disabled) onToggle(!status);
      }}
      disabled={disabled || loading}
      className={`relative inline-flex items-center gap-2 group cursor-pointer transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
      }`}
    >
      <div 
        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
          status ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-[#e2d1c3]'
        }`}
      >
        <div 
          className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 transform flex items-center justify-center ${
            status ? 'translate-x-6' : 'translate-x-0'
          }`}
        >
          {loading && <Loader2 className="w-2.5 h-2.5 animate-spin text-[#bc6746]" />}
        </div>
      </div>
      
      <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
        status ? 'text-emerald-600' : 'text-[#a55a3d]/60'
      }`}>
        {status ? labels.true : labels.false}
      </span>

      {/* Ripple effect on hover */}
      <div className="absolute inset-0 rounded-full bg-current opacity-0 group-hover:opacity-[0.03] transition-opacity mt-[-4px] mb-[-4px] ml-[-4px] mr-8 pointer-events-none" />
    </button>
  );
};
