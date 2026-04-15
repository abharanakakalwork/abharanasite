'use client';

import { useEffect } from 'react';

export default function ImageProtection() {
  useEffect(() => {
    // Only apply these restrictions in production mode
    if (process.env.NODE_ENV !== 'production') return;

    // Aggressively prevent all context menus (Right Click) everywhere on the site
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Prevent dragging elements (mostly images)
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // Prevent copying content
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };
    
    // Prevent common keyboard shortcuts for saving/copying
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S (Save), Ctrl+C (Copy), Ctrl+P (Print), Ctrl+U (View Source)
      if (
        (e.ctrlKey || e.metaKey) && 
        (e.key === 's' || e.key === 'c' || e.key === 'p' || e.key === 'u')
      ) {
        e.preventDefault();
      }
    };

    // Add listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
