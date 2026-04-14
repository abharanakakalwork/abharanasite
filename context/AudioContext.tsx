'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface AudioContextType {
  isBgPlaying: boolean;
  toggleBgAudio: () => void;
  pauseBgAudio: () => void;
  playBgAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBgPlaying, setIsBgPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInteracted = useRef(false);

  useEffect(() => {
    // Initialize audio object once
    if (typeof window !== 'undefined') {
      const audio = new Audio('/bg-audio.mp3');
      audio.loop = true;
      audioRef.current = audio;

      const handleFirstInteraction = () => {
        if (!hasInteracted.current && audioRef.current) {
          audioRef.current.play()
            .then(() => {
              setIsBgPlaying(true);
              hasInteracted.current = true;
            })
            .catch((err) => {
              console.log('Autoplay blocked or failed:', err);
            });
        }
        window.removeEventListener('mousedown', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
      };

      window.addEventListener('mousedown', handleFirstInteraction);
      window.addEventListener('touchstart', handleFirstInteraction);
      window.addEventListener('keydown', handleFirstInteraction);

      return () => {
        window.removeEventListener('mousedown', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
        // We do NOT pause here because this component stays mounted in layout
      };
    }
  }, []);

  const toggleBgAudio = () => {
    if (!audioRef.current) return;

    if (isBgPlaying) {
      audioRef.current.pause();
      setIsBgPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsBgPlaying(true))
        .catch(console.error);
    }
    hasInteracted.current = true;
  };

  const pauseBgAudio = () => {
    if (audioRef.current && isBgPlaying) {
      audioRef.current.pause();
      setIsBgPlaying(false);
    }
  };

  const playBgAudio = () => {
    if (audioRef.current && !isBgPlaying) {
      audioRef.current.play()
        .then(() => setIsBgPlaying(true))
        .catch(console.error);
    }
  };

  return (
    <AudioContext.Provider value={{ isBgPlaying, toggleBgAudio, pauseBgAudio, playBgAudio }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
