/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/book-appointment',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://www.kidneycarecentre.in https://kidneycarecentre.in;",
          },
        ],
      },
    ];
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
