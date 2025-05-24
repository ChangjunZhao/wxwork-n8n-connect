# 多阶段构建 Dockerfile for 企业微信集成平台
FROM node:22-alpine AS base

# 安装基础依赖，包括OpenSSL
RUN apk add --no-cache openssl openssl-dev

# 安装依赖阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl openssl-dev
WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json ./
# 复制 Prisma schema 文件
COPY prisma ./prisma

# 安装所有依赖（包括开发依赖，因为需要 prisma generate）
RUN npm ci

# 生成 Prisma 客户端
RUN npx prisma generate

# 构建阶段
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl openssl-dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

# 再次生成 Prisma 客户端（确保在完整代码复制后）
RUN npx prisma generate

# 构建应用
RUN npm run build

# 运行阶段
FROM base AS runner
RUN apk add --no-cache curl openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder /app/public ./public

# 设置正确的权限
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 复制构建输出
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制 Prisma 文件
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 9002

ENV PORT=9002
ENV HOSTNAME="0.0.0.0"

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:9002/api/connections || exit 1

CMD ["node", "server.js"] 