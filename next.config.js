/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Production optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    domains: ["firebasestorage.googleapis.com"],
    formats: ["image/webp", "image/avif"],
  },

  // Security headers
  async headers() {
    return [
      {
        // Apply to all routes - completely disable X-Frame-Options
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Completely permissive CSP for PDF functionality
          {
            key: "Content-Security-Policy",
            value:
              "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; font-src * data:; img-src * data: blob:; connect-src *; frame-src *; object-src *; worker-src * blob: data:; frame-ancestors *;",
          },
        ],
      },
      {
        source: "/uploads/pdfs/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "application/pdf",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/serve-pdf/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "application/pdf",
          },
          {
            key: "Content-Disposition",
            value: "inline",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/api/serve-gdrive-pdf/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "application/pdf",
          },
          {
            key: "Content-Disposition",
            value: "inline",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/pdf/:path*",
        headers: [
          // Permissive CSP for PDF viewer
          {
            key: "Content-Security-Policy",
            value:
              "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; worker-src * blob: data:; frame-ancestors *;",
          },
        ],
      },
    ];
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: "vendor",
            chunks: "all",
            test: /node_modules/,
          },
        },
      };
    }

    // PDF.js worker configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    // Copy PDF.js worker to public directory
    if (!isServer) {
      config.module.rules.push({
        test: /pdf\.worker\.(min\.)?js/,
        type: "asset/resource",
        generator: {
          filename: "static/worker/[hash][ext][query]",
        },
      });
    }

    return config;
  },
};

module.exports = nextConfig;
