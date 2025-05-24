#!/bin/bash

# 企业微信集成平台 Docker 构建脚本
# Build script for WeChat Work Integration Platform

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="wework-platform"
VERSION=${1:-latest}
REGISTRY=${DOCKER_REGISTRY:-""}

echo -e "${BLUE}🚀 开始构建企业微信集成平台 Docker 镜像${NC}"
echo -e "${BLUE}📦 项目: ${PROJECT_NAME}${NC}"
echo -e "${BLUE}🏷️  版本: ${VERSION}${NC}"

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker 未运行，请先启动 Docker${NC}"
    exit 1
fi

# 清理旧的构建缓存（可选）
read -p "$(echo -e ${YELLOW}是否清理 Docker 构建缓存？ [y/N]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧹 清理构建缓存...${NC}"
    docker builder prune -f
fi

# 构建镜像
echo -e "${YELLOW}🔨 构建生产镜像...${NC}"
if [ -n "$REGISTRY" ]; then
    IMAGE_NAME="${REGISTRY}/${PROJECT_NAME}:${VERSION}"
else
    IMAGE_NAME="${PROJECT_NAME}:${VERSION}"
fi

docker build \
    --tag $IMAGE_NAME \
    --tag ${PROJECT_NAME}:latest \
    --file Dockerfile \
    .

echo -e "${GREEN}✅ 镜像构建完成: ${IMAGE_NAME}${NC}"

# 显示镜像信息
echo -e "${BLUE}📋 镜像信息:${NC}"
docker images | grep $PROJECT_NAME

# 询问是否推送到注册表
if [ -n "$REGISTRY" ]; then
    read -p "$(echo -e ${YELLOW}是否推送到注册表 ${REGISTRY}？ [y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}📤 推送镜像到注册表...${NC}"
        docker push $IMAGE_NAME
        docker push ${REGISTRY}/${PROJECT_NAME}:latest
        echo -e "${GREEN}✅ 镜像推送完成${NC}"
    fi
fi

# 询问是否运行测试
read -p "$(echo -e ${YELLOW}是否运行容器测试？ [y/N]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧪 启动测试容器...${NC}"
    
    # 停止并删除现有测试容器
    docker stop wework-test 2>/dev/null || true
    docker rm wework-test 2>/dev/null || true
    
    # 运行测试容器
    docker run -d \
        --name wework-test \
        -p 9003:9002 \
        -e DATABASE_URL="file:./test.db" \
        $IMAGE_NAME
    
    echo -e "${BLUE}⏳ 等待容器启动...${NC}"
    sleep 10
    
    # 健康检查
    if curl -f http://localhost:9003/api/connections > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 容器运行正常${NC}"
        echo -e "${BLUE}🌐 测试地址: http://localhost:9003${NC}"
    else
        echo -e "${RED}❌ 容器启动失败${NC}"
        docker logs wework-test
    fi
    
    read -p "$(echo -e ${YELLOW}按回车键停止测试容器...${NC})"
    docker stop wework-test
    docker rm wework-test
fi

echo -e "${GREEN}🎉 构建完成！${NC}"
echo -e "${BLUE}💡 使用方法:${NC}"
echo -e "   生产环境: docker-compose up -d"
echo -e "   开发环境: docker-compose -f docker-compose.dev.yml up -d"
echo -e "   单独运行: docker run -p 9002:9002 $IMAGE_NAME" 