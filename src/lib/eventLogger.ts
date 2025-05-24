import prisma from '@/lib/prisma';
import { broadcast } from '@/app/api/ws/route';

export type LogStatus = 'Success' | 'Error' | 'Processing' | 'Info';

export interface CreateLogOptions {
  connectionId: string;
  eventType: string;
  status: LogStatus;
  details: string;
  metadata?: Record<string, any>;
}

export async function createEventLog(options: CreateLogOptions) {
  try {
    const log = await prisma.eventLog.create({
      data: {
        connectionId: options.connectionId,
        eventType: options.eventType,
        status: options.status,
        details: options.details,
        metadata: options.metadata || undefined,
        timestamp: new Date(),
      },
      include: {
        connection: {
          select: {
            name: true,
            corpId: true,
            agentId: true,
          },
        },
      },
    });

    // 广播新日志到 WebSocket 客户端
    broadcast({
      type: 'log',
      data: log,
    });

    console.log(`事件日志已创建: ${options.eventType} - ${options.status}`);
    return log;
  } catch (error) {
    console.error('创建事件日志失败:', error);
    return null;
  }
}

// 便捷方法
export const logSuccess = (connectionId: string, eventType: string, details: string, metadata?: Record<string, any>) =>
  createEventLog({ connectionId, eventType, status: 'Success', details, metadata });

export const logError = (connectionId: string, eventType: string, details: string, metadata?: Record<string, any>) =>
  createEventLog({ connectionId, eventType, status: 'Error', details, metadata });

export const logInfo = (connectionId: string, eventType: string, details: string, metadata?: Record<string, any>) =>
  createEventLog({ connectionId, eventType, status: 'Info', details, metadata });

export const logProcessing = (connectionId: string, eventType: string, details: string, metadata?: Record<string, any>) =>
  createEventLog({ connectionId, eventType, status: 'Processing', details, metadata }); 