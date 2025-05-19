
import type { EventLog } from './types'; // WeixinConnection will now come from DB

// initialConnections is removed as data will be fetched from the database.
// You can use Prisma seeding if you need initial data in your database:
// https://www.prisma.io/docs/guides/database/seed-database

export const initialEventLogs: EventLog[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 分钟前
    connectionName: '主要人事应用 (来自数据库)', // Placeholder, actual name will come from event or DB lookup
    eventType: 'text_message',
    status: 'Success',
    details: '收到文本消息：“用户X的休假申请”。已触发工作流。'
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 小时前
    connectionName: '销售CRM机器人 (来自数据库)',
    eventType: 'image_upload',
    status: 'Processing',
    details: '从潜在客户Y处收到图片。等待OCR处理。'
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 小时前
    connectionName: '技术支持频道 (来自数据库)',
    eventType: 'event_push_subscribe',
    status: 'Info',
    details: '新用户Z订阅了该应用。'
  },
  {
    id: 'log-004',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 小时前
    connectionName: '主要人事应用 (来自数据库)',
    eventType: 'api_call',
    status: 'Error',
    details: '验证传入请求签名失败。令牌不匹配。'
  },
];
