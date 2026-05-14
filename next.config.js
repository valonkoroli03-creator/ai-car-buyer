/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.autoscout24.ch' },
      { protocol: 'https', hostname: '**.autoscout24.com' },
      { protocol: 'https', hostname: '**.anibis.ch' },
      { protocol: 'https', hostname: '**.comparis.ch' },
      { protocol: 'https', hostname: '**.ricardo.ch' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
      { protocol: 'https', hostname: '**.akamaized.net' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};
module.exports = nextConfig;
