import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // 启用 standalone 模式以优化 Docker 镜像
  output: 'standalone',
  // 实验性功能
  experimental: {
    // 启用 turbo 模式（如果需要）
    turbo: {
      rules: {
        // 自定义规则
      },
    },
  },
};

export default nextConfig;
