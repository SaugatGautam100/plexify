/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/**', // This wildcard path is crucial for Firebase Storage URLs
      },
      // If you fetch images from other domains, add them here too.
      // Example for another domain:
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   port: '',
      //   pathname: '/path/to/images/**',
      // },
    ],
  },
};

module.exports = nextConfig;