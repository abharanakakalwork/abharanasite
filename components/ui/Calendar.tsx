"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Ban } from 'lucide-react';
import { cn, formatDateLocal } from '@/lib/utils';

interface CalendarSession {
  session_date: string;
  start_time: string;
  cooldown_minutes?: number;
  duration_minutes?: number;
  booked_count: number;
  capacity: number;
  is_blocked?: boolean;
}

interface CalendarException {
  exception_date: string;
  is_blocked?: boolean;
}

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  availabilityData?: {
    sessions?: CalendarSession[];
    exceptions?: CalendarException[];
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
    <div
      className={cn(
        "rounded-[32px] border border-[#dbc8b8] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(248,242,235,0.96)_45%,_rgba(244,234,224,0.92))] p-4 shadow-[0_20px_50px_rgba(98,71,50,0.08),inset_0_1px_0_rgba(255,255,255,0.85)] sm:p-6",
        className
      )}
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-2xl font-serif font-medium leading-none text-[#3d2c22]">
          {monthName} <span className="ml-1 text-[#9b7f69]">{year}</span>
        </h3>
        <div className="flex space-x-1">
          <button 
            onClick={handlePrevMonth}
            className="rounded-full border border-[#e2d2c5] bg-white/80 p-2 text-[#7a5a48] transition-colors hover:bg-[#bc6746]/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={handleNextMonth}
            className="rounded-full border border-[#e2d2c5] bg-white/80 p-2 text-[#7a5a48] transition-colors hover:bg-[#bc6746]/10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="mb-3 grid grid-cols-7">
        {weekdays.map(day => (
          <div key={day} className="py-2 text-center text-[10px] font-black uppercase tracking-[0.24em] text-[#8e725d]">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {daysInMonth.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} />;
          
          const { isBlocked, isFull, hasSessions } = getDayStatus(date);
          const selected = isSelected(date);
          const today = isToday(date);
          const isPast = date < new Date(new Date().setHours(0,0,0,0));

          return (
            <motion.button
              key={date.toDateString()}
              whileHover={!isPast && !isBlocked ? { scale: 1.04 } : {}}
              whileTap={!isPast && !isBlocked ? { scale: 0.97 } : {}}
              onClick={() => (!isPast || isAdmin) && onDateSelect(date)}
              disabled={isPast && !isAdmin}
              className={cn(
                "relative aspect-square min-h-[4.25rem] rounded-[20px] border text-sm transition-all duration-300",
                "flex flex-col items-center justify-center overflow-hidden",
                selected
                  ? "z-10 border-[#b8643d] bg-[#c76c3f] text-white shadow-[0_12px_30px_rgba(188,103,70,0.28),inset_0_0_0_2px_rgba(255,244,235,0.85)]"
                  : "border-transparent text-[#4a3b32] hover:border-[#e2c7b6] hover:bg-white/70",
                today && !selected && "border-[#d9bba8] bg-white/50",
                (isPast && !isAdmin) && "opacity-20 cursor-not-allowed",
                isBlocked && "bg-gray-100/50 opacity-40 cursor-not-allowed"
              )}
            >
              <span className={cn("relative z-10 text-base", selected ? "font-bold" : "font-medium")}>
                {date.getDate()}
              </span>

              {/* Status Indicators */}
              <div className="absolute bottom-2 flex space-x-0.5">
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
      <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-[#e8d7ca] pt-4">
         <div className="flex items-center space-x-1.5 text-[9px] font-bold uppercase tracking-widest text-[#8e725d]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#bc6746]" />
            <span>Available</span>
         </div>
         <div className="flex items-center space-x-1.5 text-[9px] font-bold uppercase tracking-widest text-[#8e725d]">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>Full</span>
         </div>
         <div className="flex items-center space-x-1.5 text-[9px] font-bold uppercase tracking-widest text-[#8e725d]">
            <div className="w-2 h-2 border-t border-l border-gray-400 rotate-45 transform translate-y-0.5" />
            <span>Closed</span>
         </div>
      </div>
    </div>
  );
};
