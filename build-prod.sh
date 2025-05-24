#!/bin/bash

# 企业微信集成平台 - 生产环境构建脚本
# WeChat Work Integration Platform - Production Build Script

set -e

# 配置变量
IMAGE_NAME="wework-platform"
VERSION=${1:-latest}
REGISTRY=${REGISTRY:-""}

echo "🚀 开始构建企业微信集成平台生产环境镜像..."
echo "📦 镜像名称: ${IMAGE_NAME}:${VERSION}"

# 清理之前的构建
echo "🧹 清理之前的构建..."
docker compose down 2>/dev/null || true

# 构建生产环境镜像
echo "🔨 构建生产环境镜像..."
docker build -f Dockerfile.prod -t ${IMAGE_NAME}:${VERSION} .

# 标记镜像
echo "🏷️ 标记镜像..."
docker tag ${IMAGE_NAME}:${VERSION} ${IMAGE_NAME}:latest

if [ ! -z "$REGISTRY" ]; then
    echo "🏷️ 标记镜像到注册中心..."
    docker tag ${IMAGE_NAME}:${VERSION} ${REGISTRY}/${IMAGE_NAME}:${VERSION}
    docker tag ${IMAGE_NAME}:${VERSION} ${REGISTRY}/${IMAGE_NAME}:latest
fi

# 显示镜像信息
echo "📊 镜像信息:"
docker images | grep ${IMAGE_NAME}

# 显示镜像大小
echo "📏 镜像大小分析:"
docker history ${IMAGE_NAME}:${VERSION} --human

# 安全扫描 (如果有 docker scan)
if command -v docker &> /dev/null && docker scan --help &> /dev/null; then
    echo "🔒 运行安全扫描..."
    docker scan ${IMAGE_NAME}:${VERSION} || echo "⚠️ 安全扫描失败或未配置"
fi

echo "✅ 生产环境镜像构建完成!"
echo ""
echo "🎯 使用方法:"
echo "  启动服务: docker compose -f docker-compose.prod.yml up -d"
echo "  查看日志: docker compose -f docker-compose.prod.yml logs -f"
echo "  停止服务: docker compose -f docker-compose.prod.yml down"
echo ""

if [ ! -z "$REGISTRY" ]; then
    echo "📤 推送到注册中心:"
    echo "  docker push ${REGISTRY}/${IMAGE_NAME}:${VERSION}"
    echo "  docker push ${REGISTRY}/${IMAGE_NAME}:latest"
fi

echo "🌐 应用访问地址: http://localhost:9002" 