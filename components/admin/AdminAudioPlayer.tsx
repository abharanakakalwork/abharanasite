'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '@/context/AudioContext';

interface AdminAudioPlayerProps {
  src: string;
}

export const AdminAudioPlayer: React.FC<AdminAudioPlayerProps> = ({ src }) => {
  const { pauseBgAudio } = useAudio();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Pause background music when playing a session
      pauseBgAudio();
      audioRef.current.play().catch(err => {
        console.error("Audio playback failed:", err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekPercentage = parseFloat(e.target.value);
    const seekTime = (seekPercentage / 100) * audioRef.current.duration;
    audioRef.current.currentTime = seekTime;
    setProgress(seekPercentage);
    setCurrentTime(seekTime);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="group relative flex flex-col space-y-2 rounded-2xl bg-white/40 border border-[#f1e4da]/50 p-4 backdrop-blur-sm transition-all hover:bg-white/60 hover:shadow-xl shadow-[#bc6746]/5">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="h-10 w-10 rounded-full bg-[#bc6746] flex items-center justify-center text-white shadow-lg shadow-[#bc6746]/20 transition-all"
        >
          <AnimatePresence mode="wait">
            {isPlaying ? (
              <motion.div
                key="pause"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
              >
                <Pause className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="play"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.15 }}
              >
                <Play className="h-5 w-5 fill-white ml-0.5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Timeline & Info */}
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold text-[#a55a3d]/60 uppercase tracking-widest">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <div className="relative group/slider flex items-center h-4">
            <input
              type="range"
              min="0"
              max="100"
              step="0.01"
              value={progress}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-1 bg-[#f1e4da] rounded-full appearance-none cursor-pointer accent-[#bc6746] z-10 opacity-0 group-hover/slider:h-2 transition-all"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />
            {/* Custom Track */}
            <div className="absolute left-0 right-0 h-1 bg-[#f1e4da] rounded-full group-hover/slider:h-2 transition-all">
              <div 
                className="h-full bg-[#bc6746] rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white border-2 border-[#bc6746] shadow-md opacity-0 group-hover/slider:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>

        {/* Mute Toggle */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          className="h-9 w-9 rounded-xl bg-white/50 flex items-center justify-center text-[#bc6746] hover:bg-[#bc6746]/10 transition-all border border-[#f1e4da]/50 shadow-sm"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </motion.button>
      </div>

      {/* Visualizer Hint (Subtle) */}
      {isPlaying && (
        <div className="flex justify-center items-center space-x-1 h-3 pt-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-0.5 bg-[#bc6746]/40 rounded-full"
              animate={{ height: [4, 12, 6, 10, 4] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

