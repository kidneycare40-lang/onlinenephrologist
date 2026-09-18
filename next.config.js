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
            value: "frame-ancestors 'self' https://www.kidneycarecentre.in https://kidneycarecentre.in https://www.onlinenephrologist.com https://onlinenephrologist.com https://www.psrihospital.com https://psrihospital.com;",
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
