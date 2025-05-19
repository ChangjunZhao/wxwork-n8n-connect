export interface WeixinConnection {
  id: string;
  name: string;
  corpId: string;
  agentId: string;
  token: string;
  encodingAESKey: string;
}

export interface EventLog {
  id: string;
  timestamp: string; 
  connectionName: string; 
  eventType: string;
  status: 'Success' | 'Error' | 'Processing' | 'Info';
  details: string;
}
