"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "info";
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
}) => {
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
              <div
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-2xl",
                  variant === "danger"
                    ? "bg-red-50 text-red-500"
                    : "bg-[#bc6746]/5 text-[#bc6746]"
                )}
              >
                {variant === "danger" ? (
                  <AlertTriangle className="h-8 w-8" />
                ) : (
                  <Info className="h-8 w-8" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="text-center">
              <h3 className="mb-2 font-serif text-2xl font-medium tracking-tight text-[#4a3b32]">
                {title}
              </h3>
              <p className="text-sm font-medium leading-relaxed text-[#a55a3d]/70">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-10 flex flex-col gap-3">
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={cn(
                  "flex h-14 w-full items-center justify-center rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all active:scale-95",
                  variant === "danger"
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600"
                    : "bg-[#bc6746] text-white shadow-lg shadow-[#bc6746]/20 hover:bg-[#a55a3d]"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  confirmText
                )}
              </button>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex h-14 w-full items-center justify-center rounded-2xl border border-[#f1e4da] bg-white text-[10px] font-black uppercase tracking-[0.4em] text-[#a55a3d]/40 transition-all hover:bg-gray-50 active:scale-95"
              >
                {cancelText}
              </button>
            </div>

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
