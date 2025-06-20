#!/bin/sh

# 企业微信集成平台 Docker 入口脚本
# WeChat Work Integration Platform Docker Entrypoint

set -e

echo "🚀 启动企业微信集成平台..."

# 等待数据库就绪 (使用简单等待，避免mysqladmin依赖)
echo "⏳ 等待数据库连接..."
sleep 15

echo "✅ 数据库等待完成"

# 运行数据库迁移
echo "🔄 运行数据库迁移..."
npx prisma migrate deploy

# 检查是否需要创建管理员用户
echo "👤 检查管理员用户..."
if [ "$CREATE_ADMIN_USER" = "true" ]; then
  echo "🔧 创建管理员用户..."
  npx tsx src/scripts/create-admin.ts || echo "⚠️ 管理员用户可能已存在"
fi

# 启动应用
echo "🌟 启动Next.js应用..."
exec "$@" 