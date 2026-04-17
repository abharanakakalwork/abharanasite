"use client";

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import axios from 'axios';

interface Student {
  id: string;
  email: string;
  name: string;
}

interface StudentAuthContextType {
  student: Student | null;
  token: string | null;
  loading: boolean;
  login: (token: string, student: Student) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  requireAuth: (callback: () => void) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export function StudentAuthProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('studentToken');
    const savedStudent = localStorage.getItem('studentProfile');
    
    if (savedToken && savedStudent) {
      setToken(savedToken);
      setStudent(JSON.parse(savedStudent));
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newStudent: Student) => {
    localStorage.setItem('studentToken', newToken);
    localStorage.setItem('studentProfile', JSON.stringify(newStudent));
    setToken(newToken);
    setStudent(newStudent);
    setIsAuthModalOpen(false);
    
    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentProfile');
    setToken(null);
    setStudent(null);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await axios.get('/api/auth/student/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.student) {
        setStudent(res.data.student);
        localStorage.setItem('studentProfile', JSON.stringify(res.data.student));
      }
    } catch (err) {
      console.error('Failed to refresh student profile:', err);
      logout();
    }
  };

  const requireAuth = (callback: () => void) => {
    if (student) {
      callback();
    } else {
      setPendingCallback(() => callback);
      setIsAuthModalOpen(true);
    }
  };

  return (
    <StudentAuthContext.Provider value={{ 
      student, 
      token, 
      loading, 
      login, 
      logout, 
      refreshProfile, 
      requireAuth,
      isAuthModalOpen,
      openAuthModal: () => setIsAuthModalOpen(true),
      closeAuthModal: () => setIsAuthModalOpen(false)
    }}>
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext);
  if (context === undefined) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
}
