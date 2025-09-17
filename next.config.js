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
        hostname: 'solo-adventurer.s3.amazonaws.com',
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
    AWS_REGION: process.env.AWS_REGION,
    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
    COGNITO_IDENTITY_POOL_ID: process.env.COGNITO_IDENTITY_POOL_ID,
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT,
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