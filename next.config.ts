import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Image Optimisation ───────────────────────────────────────────────────
  images: {
    // Serve modern formats: AVIF first, then WebP fallback
    formats: ["image/avif", "image/webp"],
    // Cache optimised images for 60 seconds (dev) / 1 year (prod)
    minimumCacheTTL: 60,
    // Responsive breakpoints used by next/image
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Compress output images (lossless PNG, lossy JPEG/AVIF/WebP)
    dangerouslyAllowSVG: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'abharanakakal.b-cdn.net',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // ─── Compression ─────────────────────────────────────────────────────────
  // Keep gzip on (default). When deploying behind a CDN/nginx with brotli,
  // set this to false and let the proxy handle it.
  compress: true,

  // ─── Turbopack (dev bundler) ──────────────────────────────────────────────
  // Turbopack replaces webpack in `next dev` for much faster HMR.
  // The `experimental.turbo` key was removed in Next.js 16; use `turbopack`.
  turbopack: {},

  // ─── Security & Performance Headers ──────────────────────────────────────
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          // Prevent content-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Force HTTPS for 2 years
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Reduce referrer info to origin only on cross-origin
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          // Disable sensors/features not needed
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          // Enable DNS prefetching for 3rd-party links
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },

      {
        // Cache public images for 7 days with stale-while-revalidate
        source: "/:path(.*\\.(?:webp|jpg|jpeg|png|gif|svg|avif|ico))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // Cache fonts for 1 year (they're content-hashed)
        source: "/:path(.*\\.(?:woff|woff2|ttf|otf|eot))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // ─── Logging ─────────────────────────────────────────────────────────────
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
 
