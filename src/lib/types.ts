export interface WeixinConnection {
  id: string;
  name: string;
  corpId: string;
  agentId: string;
  token: string;
  encodingAESKey: string;
  n8nWebhookUrl?: string; // 新增 n8n Webhook URL 字段
}

export interface EventLog {
  id: string;
  timestamp: string;
  connectionName: string;
  eventType: string;
  status: 'Success' | 'Error' | 'Processing' | 'Info';
  details: string;
}
