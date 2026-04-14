'use client';

import { useState, useEffect } from 'react';

export const useRazorpay = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (window.Razorpay) {
            setIsLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => {
            console.error('Failed to load Razorpay script');
        };
        document.body.appendChild(script);

        return () => {
            // Optional: cleanup script if needed, though usually kept for session
        };
    }, []);

    return { isLoaded };
};

// Type definition for window.Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}
