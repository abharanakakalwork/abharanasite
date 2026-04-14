"use client";

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[REALTIME] Supabase environment variables are missing. Live updates may not function.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Universal hook to subscribe to live updates for the Sanctuary ecosystem.
 * Automatically fetches joined data (like class titles) for new/updated slots.
 */
export function useYogaRealtime(
    initialSessions: any[] = [], 
    initialExceptions: any[] = [],
    initialBookings: any[] = []
) {
  const [sessions, setSessions] = useState(initialSessions);
  const [bookings, setBookings] = useState(initialBookings);
  const [exceptions, setExceptions] = useState(initialExceptions);

  // Sync state when initial data arrives from parent
  useEffect(() => {
    console.log('[REALTIME] Initial Sessions Sync:', initialSessions?.length);
    if (initialSessions?.length > 0) setSessions(initialSessions);
  }, [initialSessions]);

  useEffect(() => {
    if (initialBookings?.length > 0) setBookings(initialBookings);
  }, [initialBookings]);

  useEffect(() => {
    console.log('[REALTIME] Initial Exceptions Sync:', initialExceptions?.length);
    if (initialExceptions?.length > 0) setExceptions(initialExceptions);
  }, [initialExceptions]);

  /**
   * Fetches a session with full join information (offerings) 
   * to ensure UI has everything it needs for the newly created slot.
   */
  const refetchSessionWithJoins = useCallback(async (id: string) => {
     console.log('[REALTIME] Refetching row with joins:', id);
     const { data, error } = await supabase
       .from('yoga_sessions')
       .select('*, yoga_offerings(*)')
       .eq('id', id)
       .single();
     
     if (data && !error) {
        console.log('[REALTIME] Refetched successfully for:', data.session_date);
        setSessions((prev) => {
           const index = prev.findIndex(s => s.id === id);
           if (index !== -1) {
             const updated = [...prev];
             updated[index] = data;
             return updated;
           }
           return [data, ...prev];
        });
     } else {
        console.error('[REALTIME] Refetch failed:', error);
     }
  }, []);

  useEffect(() => {
    // 1. Subscribe to Sessions
    const sessionChannel = supabase
      .channel('sanctuary_sessions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'yoga_sessions' },
        (payload) => {
          console.log('[REALTIME] Session Event:', payload.eventType);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Trigger smart-fetch for joined data
            refetchSessionWithJoins(payload.new.id);
          }
          if (payload.eventType === 'DELETE') {
            setSessions((prev) => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // 2. Subscribe to Bookings
    const bookingChannel = supabase
      .channel('sanctuary_bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'yoga_bookings' },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setBookings((prev) => {
               const index = prev.findIndex(b => b.id === payload.new.id);
               if (index !== -1) {
                 const updated = [...prev];
                 updated[index] = { ...updated[index], ...payload.new };
                 return updated;
               }
               return [payload.new, ...prev];
            });
          }
          if (payload.eventType === 'DELETE') {
            setBookings((prev) => prev.filter(b => b.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // 3. Subscribe to Exceptions
    const exceptionChannel = supabase
      .channel('sanctuary_exceptions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'yoga_availability_exceptions' },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setExceptions((prev) => {
               const index = prev.findIndex(e => e.id === payload.new.id);
               if (index !== -1) {
                 const updated = [...prev];
                 updated[index] = { ...updated[index], ...payload.new };
                 return updated;
               }
               return [payload.new, ...prev];
            });
          }
          if (payload.eventType === 'DELETE') {
            setExceptions((prev) => prev.filter(e => e.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(exceptionChannel);
    };
  }, [refetchSessionWithJoins]);

  return { 
    sessions, setSessions, 
    bookings, setBookings, 
    exceptions, setExceptions 
  };
}
