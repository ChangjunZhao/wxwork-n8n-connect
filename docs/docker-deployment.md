# Docker 部署指南

## 概述

本文档说明如何使用Docker部署企业微信集成平台，包括新增的认证系统配置。

## 环境变量配置

### 必需环境变量

```bash
# 数据库配置
DATABASE_URL=mysql://wework:wework123@mysql:3306/wework_db

# NextAuth.js 认证配置
NEXTAUTH_SECRET=your-secure-secret-at-least-32-characters-long
NEXTAUTH_URL=http://your-domain.com
```

### 可选环境变量

```bash
# 管理员用户自动创建（开发环境推荐true，生产环境推荐false）
CREATE_ADMIN_USER=true

# 日志级别
LOG_LEVEL=info
```

## 快速启动

### 开发环境

```bash
# 1. 复制环境变量文件
cp env.example .env

# 2. 修改环境变量（特别是NEXTAUTH_SECRET）
nano .env

# 3. 启动服务
docker compose up -d

# 4. 查看日志
docker compose logs -f wework-platform
```

### 生产环境

```bash
# 1. 设置环境变量
export NEXTAUTH_SECRET="your-super-secure-secret-key-at-least-32-chars"
export NEXTAUTH_URL="https://your-domain.com"
export CREATE_ADMIN_USER="false"

# 2. 构建生产镜像
./build-prod.sh

# 3. 启动生产环境
docker compose -f docker-compose.prod.yml up -d

# 4. 手动创建管理员用户（如果CREATE_ADMIN_USER=false）
docker compose exec wework-platform npx tsx src/scripts/create-admin.ts
```

## 数据库初始化

Docker容器启动时会自动执行以下操作：

1. ✅ 等待数据库服务就绪
2. ✅ 运行Prisma数据库迁移 (`prisma migrate deploy`)
3. ✅ 创建管理员用户（如果 `CREATE_ADMIN_USER=true`）
4. ✅ 启动Next.js应用

## 默认管理员账户

当 `CREATE_ADMIN_USER=true` 时，系统会自动创建：

- **邮箱**: admin@example.com
- **密码**: admin123456
- **角色**: admin

> ⚠️ **安全提醒**: 首次登录后请立即修改密码！

## 健康检查

所有容器都配置了健康检查：

```bash
# 检查应用状态
curl http://localhost:9002/api/connections

# 检查所有服务状态
docker compose ps
```

## 服务访问

- **主应用**: http://localhost:9002
- **数据库管理**: http://localhost:8080 (Adminer)
- **MySQL**: localhost:3307
- **Redis**: localhost:6380

## 故障排除

### 认证问题

```bash
# 检查环境变量
docker compose exec wework-platform env | grep NEXTAUTH

# 重新创建管理员用户
docker compose exec wework-platform npx tsx src/scripts/create-admin.ts
```

### 数据库问题

```bash
# 手动运行迁移
docker compose exec wework-platform npx prisma migrate deploy

# 重置数据库（谨慎使用）
docker compose exec wework-platform npx prisma migrate reset --force
```

### 日志查看

```bash
# 查看应用日志
docker compose logs -f wework-platform

# 查看数据库日志
docker compose logs -f mysql

# 查看所有服务日志
docker compose logs -f
```

## 安全建议

### 生产环境

1. **必须修改默认密钥**:
   ```bash
   # 生成安全的NEXTAUTH_SECRET
   openssl rand -base64 32
   ```

2. **使用环境变量文件**:
   ```bash
   # 创建 .env.production
   echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" > .env.production
   echo "NEXTAUTH_URL=https://your-domain.com" >> .env.production
   ```

3. **禁用自动用户创建**:
   ```bash
   export CREATE_ADMIN_USER=false
   ```

4. **使用HTTPS**:
   - 配置反向代理（nginx/cloudflare）
   - 更新 `NEXTAUTH_URL` 为 https:// 地址

## 更新应用

```bash
# 1. 停止服务
docker compose down

# 2. 拉取最新代码
git pull

# 3. 重新构建
docker compose build --no-cache

# 4. 启动服务
docker compose up -d
```

## 备份与恢复

### 数据备份

```bash
# MySQL 数据备份
docker compose exec mysql mysqldump -u wework -p wework_db > backup.sql

# 完整数据卷备份
docker run --rm -v wxwork-n8n-connect_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_backup.tar.gz -C /data .
```

### 数据恢复

```bash
# MySQL 数据恢复
docker compose exec -i mysql mysql -u wework -p wework_db < backup.sql

# 完整数据卷恢复
docker run --rm -v wxwork-n8n-connect_mysql_data:/data -v $(pwd):/backup alpine tar xzf /backup/mysql_backup.tar.gz -C /data
``` 