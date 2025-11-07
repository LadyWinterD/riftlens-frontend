/** @type {import('next').NextConfig} */
const nextConfig = {
  // [“V21.4 终极 Bug 修复”！]
  // (我们 100% 必须“授权” Riot 的“官方”图标 CDN！)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com',
        port: '',
        pathname: '/cdn/**',
      },
    ],
  },
};

export default nextConfig;