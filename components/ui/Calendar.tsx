"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Ban } from 'lucide-react';
import { cn, formatDateLocal } from '@/lib/utils';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  availabilityData?: {
    sessions?: any[];
    exceptions?: any[];
  };
  className?: string;
  isAdmin?: boolean;
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  availabilityData = { sessions: [], exceptions: [] },
  className,
  isAdmin = false,
}) => {
  const [viewDate, setViewDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Prefix empty slots
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    // Days of month
    for (let i = 1; i <= lastDate; i++) {
        days.push(new Date(year, month, i));
    }
    return days;
  }, [viewDate]);

  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const year = viewDate.getFullYear();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const getDayStatus = (date: Date) => {
    const dateStr = formatDateLocal(date);
    const now = new Date();
    
    // Check manual block
    const exception = availabilityData.exceptions?.find(e => e.exception_date === dateStr);
    const isManualBlocked = exception?.is_blocked ?? false;

    // Filter day sessions
    const daySessions = availabilityData.sessions?.filter(s => s.session_date === dateStr) || [];
    
    if (daySessions.length === 0) {
        return { isBlocked: isManualBlocked, isFull: false, isClosed: true, hasSessions: false };
    }

    // A session is "Valid" if it is:
    // 1. Not in cooldown (now < start_time - cooldown)
    // 2. Not completed (now < start_time + duration)
    // 3. Not full (booked_count < capacity)
    // 4. Not manually blocked (is_blocked === false)
    
    const validSessions = daySessions.filter(s => {
        const sessionStart = new Date(`${s.session_date}T${s.start_time}`);
        const cooldownStart = new Date(sessionStart.getTime() - (s.cooldown_minutes || 60) * 60000);
        const sessionEnd = new Date(sessionStart.getTime() + (s.duration_minutes || 60) * 60000);
        
        return (
            !s.is_blocked &&
            now < cooldownStart &&
            now < sessionEnd &&
            s.booked_count < s.capacity
        );
    });

    const isFull = daySessions.every(s => s.booked_count >= s.capacity);
    const isClosed = validSessions.length === 0;

    return { 
        isBlocked: isManualBlocked || (isClosed && !isAdmin), 
        isFull: isFull && !isManualBlocked, 
        isClosed, 
        hasSessions: daySessions.length > 0 
    };
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={cn("bg-white/40 backdrop-blur-md rounded-[32px] border border-[#f1e4da] p-3 shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-serif text-[#4a3b32] font-medium leading-none">
          {monthName} <span className="text-[#a55a3d]/40 ml-1">{year}</span>
        </h3>
        <div className="flex space-x-1">
          <button 
            onClick={handlePrevMonth}
            className="p-1.5 rounded-full hover:bg-[#bc6746]/10 text-[#bc6746] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-1.5 rounded-full hover:bg-[#bc6746]/10 text-[#bc6746] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-2">
        {weekdays.map(day => (
          <div key={day} className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-[#a55a3d]/40 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} />;
          
          const { isBlocked, isFull, hasSessions } = getDayStatus(date);
          const selected = isSelected(date);
          const today = isToday(date);
          const isPast = date < new Date(new Date().setHours(0,0,0,0));

          return (
            <motion.button
              key={date.toDateString()}
              whileHover={!isPast && !isBlocked ? { scale: 1.1 } : {}}
              whileTap={!isPast && !isBlocked ? { scale: 0.95 } : {}}
              onClick={() => (!isPast || isAdmin) && onDateSelect(date)}
              disabled={isPast && !isAdmin}
              className={cn(
                "relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all duration-300",
                selected ? "bg-[#bc6746] text-white shadow-lg shadow-[#bc6746]/20 z-10" : "hover:bg-[#bc6746]/5 text-[#4a3b32]",
                today && !selected && "border border-[#bc6746]/30",
                (isPast && !isAdmin) && "opacity-20 cursor-not-allowed",
                isBlocked && "bg-gray-100/50 opacity-40 cursor-not-allowed overflow-hidden"
              )}
            >
              <span className={cn("relative z-10", selected ? "font-bold" : "font-medium")}>
                {date.getDate()}
              </span>

              {/* Status Indicators */}
              <div className="absolute bottom-1.5 flex space-x-0.5">
                {isBlocked ? (
                   <Ban className="w-2.5 h-2.5 text-red-400/50" />
                ) : hasSessions && (
                   <div className={cn(
                     "w-1 h-1 rounded-full",
                     isFull ? "bg-red-400" : (selected ? "bg-white" : "bg-[#bc6746]")
                   )} />
                )}
              </div>

              {/* Blocked Overlay */}
              {isBlocked && (
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#4a3b32_5px,#4a3b32_10px)]" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-[#f1e4da] flex flex-wrap gap-x-4 gap-y-2 justify-center">
         <div className="flex items-center space-x-1.5 text-[9px] uppercase font-bold tracking-widest text-[#a55a3d]/60">
            <div className="w-1.5 h-1.5 rounded-full bg-[#bc6746]" />
            <span>Available</span>
         </div>
         <div className="flex items-center space-x-1.5 text-[9px] uppercase font-bold tracking-widest text-[#a55a3d]/60">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>Full</span>
         </div>
         <div className="flex items-center space-x-1.5 text-[9px] uppercase font-bold tracking-widest text-[#a55a3d]/60">
            <div className="w-2 h-2 border-t border-l border-gray-400 rotate-45 transform translate-y-0.5" />
            <span>Closed</span>
         </div>
      </div>
    </div>
  );
};
