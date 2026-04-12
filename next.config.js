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
        source: '/dashboard',
        destination: '/feed',
        permanent: false,
      },
      {
        source: '/',
        destination: '/feed',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig