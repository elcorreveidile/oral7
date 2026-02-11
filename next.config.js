/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  // Note: Security headers are now handled by src/middleware.ts
  // This provides more flexible development/production configurations
}

module.exports = nextConfig
