'use client';

import { useEffect, useState } from 'react';

interface SecureVideoProps {
  videoId: string;
}

export default function SecureVideo({ videoId }: SecureVideoProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchSecureUrl() {
      if (!videoId) return;

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/video/auth?videoId=${videoId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch secure video configuration.');
        }

        const data = await response.json();
        
        if (data.error) {
           throw new Error(data.error);
        }
        
        if (isMounted && data.url) {
          setEmbedUrl(data.url);
        }
      } catch (err: any) {
        console.error('SecureVideo Error:', err);
        if (isMounted) {
          setError(err.message || 'An unexpected error occurred while loading the video.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSecureUrl();

    return () => {
      isMounted = false;
    };
  }, [videoId]);

  if (error) {
    return (
      <div className="w-full aspect-video bg-red-900/10 border-2 border-red-500/20 flex flex-col items-center justify-center text-red-500 rounded-lg p-4 text-center">
        <svg className="w-10 h-10 mb-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="text-sm font-medium">{error}</span>
      </div>
    );
  }

  if (isLoading || !embedUrl) {
    return (
      <div className="w-full aspect-video bg-zinc-900 animate-pulse rounded-lg flex items-center justify-center shadow-inner">
        {/* Sleek loading spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-zinc-400 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-xl">
      <iframe
        src={embedUrl}
        loading="lazy"
        className="absolute top-0 left-0 w-full h-full border-none"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen={true}
      />
    </div>
  );
}
