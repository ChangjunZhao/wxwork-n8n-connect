# 企业微信集成平台 Docker 部署指南

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql)](https://www.mysql.com/)

本指南将帮助您使用 Docker 快速部署企业微信集成平台。

## 📋 目录

- [快速开始](#快速开始)
- [配置文件说明](#配置文件说明)
- [环境变量](#环境变量)
- [部署方式](#部署方式)
- [维护命令](#维护命令)
- [故障排除](#故障排除)

## 🚀 快速开始

### 前置要求

- Docker 20.0+
- Docker Compose 2.0+
- 至少 2GB 可用内存

### 1. 克隆项目

```bash
git clone <repository-url>
cd wework-platform
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp env.example .env

# 编辑环境变量
vim .env
```

### 3. 启动服务

```bash
# 生产环境部署
docker-compose up -d

# 开发环境部署
docker-compose -f docker-compose.dev.yml up -d
```

### 4. 初始化数据库

```bash
# 运行数据库迁移
docker-compose exec wework-platform npx prisma migrate deploy

# 生成 Prisma 客户端（如果需要）
docker-compose exec wework-platform npx prisma generate
```

### 5. 访问应用

- **主应用**: http://localhost:9002
- **数据库管理**: http://localhost:8080 (Adminer)
- **API文档**: http://localhost:9002/api/connections

## 📁 配置文件说明

### Dockerfile

多阶段构建的生产环境镜像：

- **依赖阶段**: 安装生产依赖
- **构建阶段**: 编译应用和生成 Prisma 客户端
- **运行阶段**: 精简的运行时镜像

### docker-compose.yml

生产环境完整部署配置：

- **wework-platform**: 主应用服务
- **mysql**: MySQL 8.0 数据库
- **redis**: Redis 缓存（可选）
- **adminer**: 数据库管理工具

### docker-compose.dev.yml

开发环境配置，支持：

- 代码热重载
- 开发依赖
- 调试端口映射

## 🔧 环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DATABASE_URL` | 数据库连接字符串 | `mysql://wework:wework123@mysql:3306/wework_db` |
| `NODE_ENV` | 环境类型 | `production` / `development` |
| `PORT` | 应用端口 | `9002` |
| `NEXT_TELEMETRY_DISABLED` | 禁用遥测 | `1` |

详细配置请参考 `env.example` 文件。

## 🚢 部署方式

### 方式一：Docker Compose（推荐）

```bash
# 生产环境
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 方式二：单独运行

```bash
# 构建镜像
docker build -t wework-platform .

# 运行容器
docker run -d \
  --name wework-platform \
  -p 9002:9002 \
  -e DATABASE_URL="mysql://user:pass@host:3306/db" \
  wework-platform
```

### 方式三：使用构建脚本

```bash
# 给脚本执行权限
chmod +x build.sh

# 运行构建脚本
./build.sh

# 构建特定版本
./build.sh v1.0.0
```

## 🔧 维护命令

### 构建和更新

```bash
# 重新构建镜像
docker-compose build --no-cache

# 更新并重启服务
docker-compose up -d --build
```

### 数据库操作

```bash
# 数据库迁移
docker-compose exec wework-platform npx prisma migrate deploy

# 重置数据库
docker-compose exec wework-platform npx prisma migrate reset

# 查看数据库状态
docker-compose exec wework-platform npx prisma migrate status
```

### 日志和监控

```bash
# 查看应用日志
docker-compose logs -f wework-platform

# 查看数据库日志
docker-compose logs -f mysql

# 监控容器状态
docker-compose ps

# 查看资源使用情况
docker stats
```

### 备份和恢复

```bash
# 备份数据库
docker-compose exec mysql mysqldump -u wework -pwework123 wework_db > backup.sql

# 恢复数据库
docker-compose exec -T mysql mysql -u wework -pwework123 wework_db < backup.sql

# 备份 volume 数据
docker run --rm -v wework-platform_mysql_data:/data -v $(pwd):/backup ubuntu tar czf /backup/mysql_backup.tar.gz -C /data .
```

## 🐛 故障排除

### 常见问题

#### 1. 容器启动失败

```bash
# 检查容器状态
docker-compose ps

# 查看详细日志
docker-compose logs wework-platform

# 检查端口占用
lsof -i :9002
```

#### 2. 数据库连接失败

```bash
# 检查数据库容器
docker-compose logs mysql

# 测试数据库连接
docker-compose exec mysql mysql -u wework -pwework123 -e "SELECT 1"

# 检查网络连接
docker-compose exec wework-platform ping mysql
```

#### 3. 权限问题

```bash
# 检查文件权限
ls -la

# 修复权限
sudo chown -R $(id -u):$(id -g) .
```

#### 4. 内存不足

```bash
# 检查系统资源
docker system df

# 清理未使用的资源
docker system prune -a
```

### 性能优化

#### 1. 镜像优化

```bash
# 使用多阶段构建减少镜像大小
# 清理构建缓存
docker builder prune

# 使用 .dockerignore 排除不必要文件
```

#### 2. 容器资源限制

```yaml
# docker-compose.yml 中添加资源限制
services:
  wework-platform:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

### 开发调试

```bash
# 进入容器调试
docker-compose exec wework-platform sh

# 在容器内运行命令
docker-compose exec wework-platform npm run dev

# 查看容器文件系统
docker-compose exec wework-platform ls -la
```

## 📞 支持

如果您遇到问题，请：

1. 检查 [故障排除](#故障排除) 部分
2. 查看容器日志获取详细错误信息
3. 确认环境变量配置正确
4. 验证网络连接和端口配置

## 🔄 更新部署

```bash
# 1. 停止当前服务
docker-compose down

# 2. 拉取最新代码
git pull origin main

# 3. 重新构建并启动
docker-compose up -d --build

# 4. 运行数据库迁移（如果有）
docker-compose exec wework-platform npx prisma migrate deploy
```

---

📝 **注意**: 生产环境部署前请确保：
- 修改默认密码
- 配置适当的安全策略
- 设置监控和日志收集
- 定期备份数据 