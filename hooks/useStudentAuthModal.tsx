"use client";

import { useStudentAuth } from "./useStudentAuth";

/**
 * Convenience hook to manage the Student Authentication Modal state.
 * Specifically designed for UI components like the Navbar.
 */
export function useStudentAuthModal() {
  const { isAuthModalOpen, openAuthModal, closeAuthModal } = useStudentAuth();

  return {
    isOpen: isAuthModalOpen,
    openModal: openAuthModal,
    closeModal: closeAuthModal
  };
}
