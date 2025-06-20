# 认证系统文档

## 概述

企业微信集成平台现已集成完整的用户认证系统，基于 NextAuth.js 构建，提供安全可靠的用户登录、注册和权限管理功能。

## 🔐 功能特性

### 1. 用户认证
- ✅ 邮箱/密码登录
- ✅ 用户注册
- ✅ 安全密码加密（bcrypt）
- ✅ JWT会话管理
- ✅ 自动登录状态保持

### 2. 权限管理
- ✅ 基于角色的访问控制（RBAC）
- ✅ 管理员和普通用户角色
- ✅ 路由级别的权限保护
- ✅ API接口权限验证

### 3. 用户界面
- ✅ 现代化登录/注册页面
- ✅ 用户头像和菜单
- ✅ 响应式设计
- ✅ 实时用户状态显示

## 🚀 快速开始

### 1. 环境配置

确保在 `.env` 文件中设置以下环境变量：

```bash
# NextAuth.js 配置
NEXTAUTH_SECRET=your-nextauth-secret-here-should-be-random-string-at-least-32-chars
NEXTAUTH_URL=http://localhost:9002

# 数据库配置
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
```

### 2. 数据库初始化

```bash
# 推送数据库架构
npm run prisma:db-push

# 生成 Prisma 客户端
npm run prisma:generate
```

### 3. 创建管理员用户

```bash
# 创建初始管理员账户
npm run auth:create-admin
```

默认管理员账户：
- 邮箱：`admin@example.com`
- 密码：`admin123456`

⚠️ **重要**：首次登录后请立即修改默认密码！

### 4. 启动应用

```bash
npm run dev
```

访问 `http://localhost:9002` 将自动重定向到登录页面。

## 📋 用户管理

### 用户角色

系统支持两种用户角色：

1. **管理员 (admin)**
   - 完全系统访问权限
   - 用户管理权限
   - 所有功能访问权限

2. **普通用户 (user)**
   - 基本功能访问权限
   - 受限的系统访问

### 注册新用户

用户可以通过以下方式注册：

1. 访问 `/auth/signup` 页面
2. 填写必要信息（姓名、邮箱、密码）
3. 提交注册表单
4. 注册成功后跳转到登录页面

### 登录流程

1. 访问 `/auth/signin` 页面
2. 输入邮箱和密码
3. 点击"登录"按钮
4. 成功后重定向到主页面

## 🛡️ 安全特性

### 1. 密码安全
- 使用 bcrypt 进行密码哈希
- 最少6位密码要求
- 密码强度验证

### 2. 会话管理
- JWT Token 认证
- 自动会话过期
- 安全的会话存储

### 3. 路由保护
- 自动重定向未认证用户
- 中间件级别的权限检查
- API 接口认证验证

### 4. CSRF 保护
- NextAuth.js 内置 CSRF 保护
- 安全的表单提交
- 防止跨站点请求伪造

## 🔧 开发指南

### 在页面中使用认证

```tsx
"use client";
import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>加载中...</div>;
  
  if (!session) return <div>请先登录</div>;

  return (
    <div>
      <h1>欢迎, {session.user.name}!</h1>
      <p>您的角色: {session.user.role}</p>
    </div>
  );
}
```

### 在 API 路由中验证用户

```typescript
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const user = await requireAuth(request);
    
    // 处理已认证的请求
    return NextResponse.json({ message: "成功", user });
  } catch (error) {
    return NextResponse.json(
      { message: "未授权访问" }, 
      { status: 401 }
    );
  }
}
```

### 管理员权限验证

```typescript
import { requireAdmin } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
  try {
    // 验证管理员权限
    const admin = await requireAdmin(request);
    
    // 执行管理员操作
    return NextResponse.json({ message: "操作成功" });
  } catch (error) {
    return NextResponse.json(
      { message: "需要管理员权限" }, 
      { status: 403 }
    );
  }
}
```

## 🔄 登出流程

用户可以通过以下方式登出：

1. 点击右上角用户头像
2. 选择"退出登录"
3. 系统清除会话并重定向到登录页面

## 📱 移动端支持

认证系统完全支持移动端：
- 响应式登录/注册页面
- 触控友好的界面
- 移动端优化的用户菜单

## 🚨 故障排除

### 常见问题

1. **登录后无法访问页面**
   - 检查 NEXTAUTH_SECRET 是否设置
   - 确认数据库连接正常
   - 验证用户账户是否激活

2. **注册失败**
   - 检查邮箱格式是否正确
   - 确认密码符合要求（至少6位）
   - 检查数据库写入权限

3. **会话过期问题**
   - 检查 NEXTAUTH_URL 配置
   - 确认系统时间正确
   - 验证 JWT 配置

### 调试技巧

```bash
# 查看数据库中的用户
npm run prisma:studio

# 检查环境变量
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL
```

## 🔮 未来计划

- [ ] 邮箱验证功能
- [ ] 密码重置功能
- [ ] 双因素认证 (2FA)
- [ ] OAuth 登录支持
- [ ] 用户权限细粒度控制
- [ ] 登录审计日志

## 📞 技术支持

如有问题或建议，请：
1. 查看本文档的故障排除部分
2. 检查项目的 GitHub Issues
3. 联系开发团队

---

**安全提醒**：
- 请定期更新密码
- 不要在生产环境使用默认密码
- 确保 NEXTAUTH_SECRET 足够复杂且保密
- 定期备份用户数据 