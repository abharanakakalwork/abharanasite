"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  type?: "text" | "date" | "time";
  isLoading?: boolean;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  placeholder = "Enter value...",
  defaultValue = "",
  confirmText = "Continue",
  type = "text",
  isLoading = false,
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-[#f1e4da] bg-white/80 p-8 shadow-2xl backdrop-blur-2xl"
          >
            {/* Header Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#bc6746]/5 text-[#bc6746]">
                <MessageSquare className="h-8 w-8" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center">
              <h3 className="mb-2 font-serif text-2xl font-medium tracking-tight text-[#4a3b32]">
                {title}
              </h3>
              <p className="mb-8 text-sm font-medium leading-relaxed text-[#a55a3d]/70">
                {message}
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  autoFocus
                  type={type}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-[#f1e4da] bg-white px-6 py-4 text-base font-medium text-[#4a3b32] outline-none transition-all focus:border-[#bc6746] focus:ring-4 focus:ring-[#bc6746]/5 disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading || !value.trim()}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#bc6746] text-[10px] font-black uppercase tracking-[0.4em] text-white shadow-lg shadow-[#bc6746]/20 transition-all hover:bg-[#a55a3d] disabled:opacity-30 active:scale-95"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {confirmText} <Send className="h-3 w-3" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex h-14 w-full items-center justify-center rounded-2xl border border-[#f1e4da] bg-white text-[10px] font-black uppercase tracking-[0.4em] text-[#a55a3d]/40 transition-all hover:bg-gray-50 disabled:opacity-30 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Close Button */}
            {!isLoading && (
              <button
                onClick={onClose}
                className="absolute right-6 top-6 rounded-full p-2 text-[#a55a3d]/20 transition-colors hover:bg-gray-100 hover:text-[#bc6746]"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
