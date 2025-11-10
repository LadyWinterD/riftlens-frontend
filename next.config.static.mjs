/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出配置（用于 S3 + CloudFront）
  output: 'export',
  
  // 静态导出时需要禁用图片优化
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com',
        port: '',
        pathname: '/cdn/**',
      },
    ],
  },
  
  // 可选：配置 basePath（如果部署在子目录）
  // basePath: '/rift-rewind',
  
  // 可选：配置 trailingSlash
  trailingSlash: true,
};

export default nextConfig;
