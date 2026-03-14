/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,

  // 不写 experimental.turbo，也不报 invalid key
  // Turbopack 默认启用，无需额外配置

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },

  webpack(config, { isServer }) {
    // SVG 处理
    const fileLoaderRule = config.module.rules.find(
      (rule) => rule.test?.test?.('.svg')
    );

    if (fileLoaderRule) {
      config.module.rules.push(
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/, // *.svg?url -> URL
        },
        {
          test: /\.svg$/i,
          issuer: { not: /\.(css|scss|sass)$/ },
          resourceQuery: { not: /url/ }, // 转成 React 组件
          loader: '@svgr/webpack',
          options: { dimensions: false, titleProp: true },
        }
      );

      fileLoaderRule.exclude = /\.svg$/i;
    }

    // Node 内置模块 polyfill（浏览器安全）
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      crypto: false,
    };

    return config;
  },
};

module.exports = withPWA(nextConfig);
