// Corresponds to the Prisma model, but used for API request/response and frontend components.
// createdAt and updatedAt are handled by Prisma and usually not part of creation/update forms directly.
export interface WeixinConnection {
  id: string;
  name: string;
  corpId: string;
  agentId: string;
  token: string;
  encodingAESKey: string;
  n8nWebhookUrl?: string | null; // Prisma schema allows null, ensure consistency
  createdAt?: string | Date; // Optional on client, Prisma provides it
  updatedAt?: string | Date; // Optional on client, Prisma provides it
}

// For form submission, ID might be optional (for new connections)
export type WeixinConnectionFormData = Omit<WeixinConnection, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

// Pagination response for connections
export interface ConnectionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ConnectionsResponse {
  connections: WeixinConnection[];
  pagination: ConnectionPagination;
}

export interface EventLog {
  id: string;
  timestamp: string;
  connectionId: string;
  connection: {
    name: string;
    corpId?: string;
    agentId?: string;
  };
  eventType: string;
  status: 'Success' | 'Error' | 'Processing' | 'Info';
  details: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface LogPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface LogsResponse {
  logs: EventLog[];
  pagination: LogPagination;
}
