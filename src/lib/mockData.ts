import type { WeixinConnection, EventLog } from './types';

export const initialConnections: WeixinConnection[] = [
  { id: 'conn-001', name: 'Main HR App', corpId: 'wwCorpId001', agentId: '1000001', token: 'HRAppToken', encodingAESKey: 'HRAppEncodingKeyxxxxxxxxxxxxxxxxxxxxxxx' },
  { id: 'conn-002', name: 'Sales CRM Bot', corpId: 'wwCorpId002', agentId: '1000002', token: 'SalesBotToken', encodingAESKey: 'SalesBotEncodingKeyxxxxxxxxxxxxxxxxxxxxx' },
  { id: 'conn-003', name: 'Support Channel', corpId: 'wwCorpId003', agentId: '1000003', token: 'SupportToken', encodingAESKey: 'SupportEncodingKeyxxxxxxxxxxxxxxxxxxxx' },
];

export const initialEventLogs: EventLog[] = [
  { 
    id: 'log-001', 
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    connectionName: 'Main HR App', 
    eventType: 'text_message', 
    status: 'Success', 
    details: 'Received text message: "Vacation request for user X". Workflow triggered.' 
  },
  { 
    id: 'log-002', 
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    connectionName: 'Sales CRM Bot', 
    eventType: 'image_upload', 
    status: 'Processing', 
    details: 'Image received from lead Y. Awaiting OCR processing.' 
  },
  { 
    id: 'log-003', 
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    connectionName: 'Support Channel', 
    eventType: 'event_push_subscribe', 
    status: 'Info', 
    details: 'New user Z subscribed to the application.' 
  },
  { 
    id: 'log-004', 
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    connectionName: 'Main HR App', 
    eventType: 'api_call', 
    status: 'Error', 
    details: 'Failed to validate incoming request signature. Token mismatch.' 
  },
];
