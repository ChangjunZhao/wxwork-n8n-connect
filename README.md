# 企业微信集成平台

一个基于 Next.js 的企业微信集成平台，支持企业微信应用管理、事件日志记录和 n8n 工作流集成。

## 技术栈

- **前端**: Next.js 15.2.3, TypeScript, Tailwind CSS, Radix UI, shadcn/ui
- **后端**: Next.js API Routes, Prisma ORM, MySQL
- **实时通信**: WebSocket (ws)
- **数据验证**: Zod
- **AI集成**: Google AI (genkit)
- **企业微信集成**: wxcrypt (加解密), xml2js (XML解析)

## 主要功能

### 1. 企业微信应用管理 ✅ **已完成**
- **连接管理**: 添加、编辑、删除企业微信应用配置
- **配置支持**: 企业ID、应用ID、Token、EncodingAESKey
- **Webhook集成**: 可选配置 n8n Webhook URL
- **回调地址**: 一键复制企业微信回调地址
  - 智能生成回调地址格式：`{host}/api/weixin/callback/{corpId}/{agentId}`
  - 弹窗显示应用信息和详细配置说明
  - 一键复制到剪贴板功能

### 2. 事件日志系统 ✅ **已完成**
- **完整的日志记录**: 自动记录所有企业微信事件和处理结果
- **高级筛选功能**: 
  - 按状态筛选 (成功/错误/处理中/信息)
  - 按事件类型筛选 (文本消息/图片上传/API调用/n8n触发等)
  - 按时间范围筛选
  - 全文搜索 (支持详情和事件类型搜索)
- **分页显示**: 支持自定义每页显示条数 (10/20/50/100)
- **详情查看**: 点击查看完整日志详情，包括元数据
- **实时更新**: WebSocket 实时推送新日志 (基础实现)
- **数据导出**: 支持 CSV 格式导出日志数据
- **响应式设计**: 适配移动端和桌面端

### 3. 企业微信回调处理 ✅ **已完成**
- **消息加解密**：集成 `wxcrypt` 库实现标准加解密
- **XML解析**：使用 `xml2js` 解析企业微信消息
- 接收企业微信事件回调
- 自动验证签名
- 解密加密消息内容
- 解析多种消息类型（文本、图片、事件等）
- 自动创建事件日志
- 触发 n8n 工作流
- 支持路径参数 `{corpId}/{agentId}`

### 4. n8n 工作流集成
- 支持配置 n8n Webhook URL
- 自动触发工作流
- 记录触发结果

## 数据库模型

### WeixinConnection (企业微信连接)
```prisma
model WeixinConnection {
  id              String      @id @default(cuid())
  name            String
  corpId          String
  agentId         String
  token           String
  encodingAESKey  String
  n8nWebhookUrl   String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  eventLogs       EventLog[]

  @@unique([corpId, agentId], name: "corpId_agentId_unique_constraint")
}
```

### EventLog (事件日志) ✅ **已实现**
```prisma
model EventLog {
  id           String            @id @default(cuid())
  timestamp    DateTime          @default(now())
  connectionId String
  connection   WeixinConnection  @relation(fields: [connectionId], references: [id], onDelete: Cascade)
  eventType    String
  status       String            // 'Success' | 'Error' | 'Processing' | 'Info'
  details      String            @db.Text
  metadata     Json?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  @@index([timestamp])
  @@index([connectionId])
  @@index([eventType])
  @@index([status])
}
```

## API 接口

### 日志相关 API ✅ **已实现**

#### GET /api/logs
获取日志列表，支持分页和筛选
- **查询参数**:
  - `page`: 页码 (默认: 1)
  - `limit`: 每页条数 (默认: 20)
  - `status`: 状态筛选
  - `eventType`: 事件类型筛选
  - `connectionId`: 连接ID筛选
  - `startDate`: 开始时间
  - `endDate`: 结束时间
  - `search`: 搜索关键词

#### POST /api/logs
创建新日志记录
- **请求体**:
```json
{
  "connectionId": "string",
  "eventType": "string", 
  "status": "Success|Error|Processing|Info",
  "details": "string",
  "metadata": {}
}
```

#### DELETE /api/logs
批量删除旧日志
- **查询参数**:
  - `days`: 删除多少天前的日志 (默认: 30)

#### GET /api/logs/[id]
获取单个日志详情

### 企业微信回调 API ✅ **已更新**
#### GET /api/weixin/callback/{corpId}/{agentId}
企业微信接口验证（支持路径参数）
- **路径参数**:
  - `corpId`: 企业ID
  - `agentId`: 应用ID
- **查询参数**:
  - `msg_signature`: 消息签名
  - `timestamp`: 时间戳
  - `nonce`: 随机数
  - `echostr`: 验证字符串

#### POST /api/weixin/callback/{corpId}/{agentId}
处理企业微信事件回调（支持路径参数）
- **路径参数**:
  - `corpId`: 企业ID
  - `agentId`: 应用ID
- **查询参数**:
  - `msg_signature`: 消息签名
  - `timestamp`: 时间戳
  - `nonce`: 随机数
- **请求体**: XML 格式的企业微信消息数据

**回调地址示例**:
- 开发环境: `http://localhost:9002/api/weixin/callback/your_corp_id/your_agent_id`
- 生产环境: `https://yourdomain.com/api/weixin/callback/your_corp_id/your_agent_id`

### WebSocket API ✅ **已实现**
#### GET /api/ws
WebSocket 连接端点 (基础实现)

## 使用指南

### 企业微信配置
详细的企业微信应用配置指南请参考：[企业微信配置指南](./docs/wework-setup.md)

### 基本配置步骤
1. 创建企业微信应用
2. 获取 CorpID、AgentID、Token、EncodingAESKey
3. 在系统中添加连接配置
4. 设置回调地址：`https://yourdomain.com/api/weixin/callback/{corpId}/{agentId}`
5. 验证并测试

## 安装和运行

1. 克隆项目
```bash
git clone <repository-url>
cd studio
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接
```

4. 初始化数据库
```bash
npx prisma db push
```

5. 启动开发服务器
```bash
npm run dev
```

6. 访问应用
- 主页: http://localhost:9002
- 日志页面: http://localhost:9002/logs

## 测试

### API 测试
```bash
# 运行通用API测试脚本
node test-api.js

# 运行企业微信回调API测试脚本（路径参数版本）
node test-callback-api.js
```

### 手动测试企业微信回调
```bash
# 测试接口验证 (GET请求)
curl "http://localhost:9002/api/weixin/callback/your_corp_id/your_agent_id?msg_signature=test&timestamp=$(date +%s)&nonce=test123&echostr=hello"

# 测试事件回调 (POST请求)
curl -X POST "http://localhost:9002/api/weixin/callback/your_corp_id/your_agent_id?msg_signature=test&timestamp=$(date +%s)&nonce=test123" \
  -H "Content-Type: text/xml" \
  -d '<xml><ToUserName>your_corp_id</ToUserName><FromUserName>test_user</FromUserName><CreateTime>1234567890</CreateTime><MsgType>text</MsgType><Content>Hello World</Content></xml>'
```

## 开发状态

### ✅ 已完成
- [x] 基础项目结构
- [x] **企业微信连接管理（完整功能）**
  - [x] 添加、编辑、删除连接配置
  - [x] 数据验证和唯一性约束
  - [x] **一键复制回调地址功能**
  - [x] 智能回调地址生成
  - [x] 用户友好的配置指南
- [x] 数据库模型设计
- [x] **完整的事件日志系统**
  - [x] 日志记录和存储
  - [x] 高级筛选功能
  - [x] 分页显示
  - [x] 详情查看
  - [x] 数据导出
  - [x] 响应式UI设计
- [x] API 路由实现
- [x] WebSocket 基础实现
- [x] **企业微信回调处理框架（支持路径参数和加解密）**
  - [x] 动态路由 `/api/weixin/callback/{corpId}/{agentId}`
  - [x] 自动连接配置查找
  - [x] 路径参数解析和验证
  - [x] **真正的消息加解密（wxcrypt）**
  - [x] **XML消息解析（xml2js）**
  - [x] **多种消息类型处理**
  - [x] 完整的日志记录

### 🚧 待完成
- [ ] 完整的 WebSocket 实时更新
- [ ] 用户认证和权限管理
- [ ] 更多事件类型支持
- [ ] 性能优化
- [ ] 单元测试
- [ ] 部署配置

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
