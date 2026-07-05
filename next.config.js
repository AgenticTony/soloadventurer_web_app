/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
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
    // NOTE: no redirect for '/' — config redirects run BEFORE middleware, so a
    // root redirect makes the public landing page unreachable to anonymous
    // visitors (acquisition surface, FOUNDATIONS §3.5). Authenticated users are
    // routed '/' → '/discover' by src/middleware.ts instead.
    return [
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
