import type { WeixinConnection, EventLog } from './types';

export const initialConnections: WeixinConnection[] = [
  { id: 'conn-001', name: '主要人事应用', corpId: 'wwCorpId001', agentId: '1000001', token: 'HRAppToken', encodingAESKey: 'HRAppEncodingKeyxxxxxxxxxxxxxxxxxxxxxxx', n8nWebhookUrl: 'http://localhost:5678/webhook/mock-hr-webhook-id' },
  { id: 'conn-002', name: '销售CRM机器人', corpId: 'wwCorpId002', agentId: '1000002', token: 'SalesBotToken', encodingAESKey: 'SalesBotEncodingKeyxxxxxxxxxxxxxxxxxxxxx' },
  { id: 'conn-003', name: '技术支持频道', corpId: 'wwCorpId003', agentId: '1000003', token: 'SupportToken', encodingAESKey: 'SupportEncodingKeyxxxxxxxxxxxxxxxxxxxx', n8nWebhookUrl: 'http://localhost:5678/webhook/mock-support-webhook-id' },
];

export const initialEventLogs: EventLog[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 分钟前
    connectionName: '主要人事应用',
    eventType: 'text_message',
    status: 'Success',
    details: '收到文本消息：“用户X的休假申请”。已触发工作流。'
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 小时前
    connectionName: '销售CRM机器人',
    eventType: 'image_upload',
    status: 'Processing',
    details: '从潜在客户Y处收到图片。等待OCR处理。'
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 小时前
    connectionName: '技术支持频道',
    eventType: 'event_push_subscribe',
    status: 'Info',
    details: '新用户Z订阅了该应用。'
  },
  {
    id: 'log-004',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 小时前
    connectionName: '主要人事应用',
    eventType: 'api_call',
    status: 'Error',
    details: '验证传入请求签名失败。令牌不匹配。'
  },
];
