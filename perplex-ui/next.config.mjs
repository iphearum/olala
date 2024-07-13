/** @type {import('next').NextConfig} */
// const { i18n } = require('./next-i18next.config');

const nextConfig = {
  // i18n,
  images: {
    remotePatterns: [
      {
        hostname: 's2.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
