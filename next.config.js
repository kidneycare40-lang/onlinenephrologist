/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/book-online-consultation',
        destination: '/book-appointment?type=online_intl',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
