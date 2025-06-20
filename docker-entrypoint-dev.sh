#!/bin/sh

# 企业微信集成平台 Docker 开发环境入口脚本
# WeChat Work Integration Platform Docker Development Entrypoint

set -e

echo "🚀 启动企业微信集成平台开发环境..."

# 等待数据库就绪 (简单等待，避免mysqladmin依赖)
echo "⏳ 等待数据库就绪..."
sleep 15

echo "✅ 数据库等待完成"

# 运行数据库schema同步（开发环境使用db push而不是migrate）
echo "🔄 同步数据库schema..."
npx prisma db push

# 检查是否需要创建管理员用户
echo "👤 检查管理员用户..."
if [ "$CREATE_ADMIN_USER" = "true" ]; then
  echo "🔧 创建管理员用户..."
  npx tsx src/scripts/create-admin.ts || echo "⚠️ 管理员用户可能已存在"
fi

# 启动开发服务器
echo "🌟 启动Next.js开发服务器..."
exec npm run dev 