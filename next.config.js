/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    CUSTOM_DOMAIN: process.env.CUSTOM_DOMAIN,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/discover',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/discover',
        permanent: false,
      },
      {
        source: '/feed',
        destination: '/discover',
        permanent: false,
      },
      {
        source: '/groups',
        destination: '/meetups',
        permanent: false,
      },
      {
        source: '/events',
        destination: '/meetups',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
