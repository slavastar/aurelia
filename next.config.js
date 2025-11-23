/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // For PDF uploads
    },
  },
  // Add empty turbopack config to silence warning
  turbopack: {},
  // Allow PDF uploads
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
}

module.exports = nextConfig
