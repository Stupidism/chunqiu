/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@chunqiu/ui', '@chunqiu/types', '@chunqiu/game-core'],
};

module.exports = nextConfig;
