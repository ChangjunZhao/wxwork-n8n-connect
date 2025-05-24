import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma'; // 引入 Prisma Client
import { logSuccess, logError, logInfo, logProcessing } from '@/lib/eventLogger';
import { parseStringPromise } from 'xml2js';

// 引入企业微信加解密库 - 替换为 wxcrypt
const WXBizMsgCrypt = require('wxcrypt');

interface RouteContext {
  params: {
    corpId: string;
    agentId: string;
  };
}

// 辅助函数：根据 CorpID 和 AgentID 从数据库查找连接配置
async function findConnectionByCorpAndAgent(corpId: string, agentId: string) {
  try {
    const connection = await prisma.weixinConnection.findUnique({
      where: {
        corpId_agentId_unique_constraint: { // 使用 Prisma schema 中定义的唯一约束名称
          corpId: corpId,
          agentId: agentId,
        }
      },
    });
    return connection;
  } catch (error) {
    console.error(`数据库查询连接失败 (CorpID: ${corpId}, AgentID: ${agentId}):`, error);
    return null;
  }
}

// 解析XML消息内容
async function parseXmlMessage(xmlString: string) {
  try {
    const result = await parseStringPromise(xmlString, { 
      explicitArray: false,
      ignoreAttrs: true 
    });
    return result.xml || result;
  } catch (error) {
    console.error('解析XML失败:', error);
    return null;
  }
}

// 验证请求参数
function validateRequestParams(msgSignature: string | null, timestamp: string | null, nonce: string | null) {
  return msgSignature && timestamp && nonce;
}

// 解密和解析消息
async function decryptAndParseMessage(
  connection: any, 
  msgSignature: string, 
  timestamp: string, 
  nonce: string, 
  body: string,
  corpId: string,
  agentId: string
) {
  try {
    // 使用 wxcrypt 创建加密解密实例
    const wxBizMsgCrypt = new WXBizMsgCrypt(connection.token, connection.encodingAESKey, corpId);
    const decryptedMessage = wxBizMsgCrypt.decryptMsg(msgSignature, timestamp, nonce, body);
    
    // 解析解密后的XML消息
    const xmlData = await parseXmlMessage(decryptedMessage);
    if (!xmlData) {
      throw new Error('解析XML消息失败');
    }

    // 提取事件数据
    const eventData = {
      ToUserName: xmlData.ToUserName,
      FromUserName: xmlData.FromUserName,
      CreateTime: xmlData.CreateTime,
      MsgType: xmlData.MsgType,
      Content: xmlData.Content,
      MsgId: xmlData.MsgId,
      AgentID: xmlData.AgentID,
      Event: xmlData.Event,
      EventKey: xmlData.EventKey,
      MediaId: xmlData.MediaId,
      // 包含原始XML和解密后的XML
      originalEncryptedXML: body,
      decryptedXML: decryptedMessage,
      // 完整的XML数据
      fullXmlData: xmlData
    };

    console.log('解密并解析的消息数据:', eventData);
    return eventData;
  } catch (error) {
    await logError(
      connection.id,
      'message_decryption',
      `消息解密失败 (${corpId}/${agentId}): ${error instanceof Error ? error.message : String(error)}`,
      {
        corpId,
        agentId,
        error: String(error),
        encryptedBody: body.substring(0, 200) + '...'
      }
    );
    // 抛出带有状态码信息的错误
    const decryptionError = new Error('Message decryption failed');
    (decryptionError as any).statusCode = 400;
    throw decryptionError;
  }
}

// 处理不同类型的消息
async function processMessage(eventData: any, connection: any, corpId: string, agentId: string) {
  const eventType = eventData.Event ? `event_${eventData.Event}` : 
                   eventData.MsgType ? `message_${eventData.MsgType}` : 'unknown';
  
  const details = eventData.Content ? eventData.Content : 
                 eventData.Event ? `事件: ${eventData.Event}` : 
                 '未知消息类型';

  await logProcessing(
    connection.id,
    eventType,
    `收到企业微信消息 (${corpId}/${agentId}): ${details}`,
    {
      corpId,
      agentId,
      ...eventData,
    }
  );

  // 处理不同类型的消息和事件
  let processResult = null;
  try {
    switch (eventData.MsgType) {
      case 'text':
        processResult = { 
          action: 'text_processed', 
          response: 'Text message received',
          content: eventData.Content 
        };
        break;
      case 'image':
        processResult = { 
          action: 'image_processed', 
          response: 'Image message received',
          mediaId: eventData.MediaId 
        };
        break;
      case 'event':
        switch (eventData.Event) {
          case 'subscribe':
            processResult = { 
              action: 'subscribe_processed', 
              response: 'Subscribe event received' 
            };
            break;
          case 'unsubscribe':
            processResult = { 
              action: 'unsubscribe_processed', 
              response: 'Unsubscribe event received' 
            };
            break;
          case 'click':
            processResult = { 
              action: 'menu_click_processed', 
              response: 'Menu click event received',
              eventKey: eventData.EventKey 
            };
            break;
          default:
            processResult = { 
              action: 'event_processed', 
              response: `Event ${eventData.Event} received` 
            };
        }
        break;
      default:
        processResult = { 
          action: 'unknown_processed', 
          response: 'Unknown message type received',
          msgType: eventData.MsgType 
        };
    }

    await logSuccess(
      connection.id,
      'message_processing',
      `消息处理完成 (${corpId}/${agentId}): ${eventType}`,
      {
        corpId,
        agentId,
        ...processResult,
        eventData
      }
    );
    
    return processResult;
  } catch (error) {
    await logError(
      connection.id,
      'message_processing',
      `消息处理失败 (${corpId}/${agentId}): ${error instanceof Error ? error.message : String(error)}`,
      { 
        corpId,
        agentId,
        error: String(error), 
        eventData 
      }
    );
    throw error;
  }
}

// 触发 n8n webhook
async function triggerN8nWebhook(
  connection: any, 
  eventData: any, 
  processResult: any, 
  corpId: string, 
  agentId: string
) {
  if (!connection.n8nWebhookUrl) {
    await logInfo(
      connection.id,
      'n8n_webhook',
      `未配置 n8n Webhook URL (${corpId}/${agentId})，跳过工作流触发`
    );
    return;
  }

  try {
    const webhookPayload = {
      connection: {
        id: connection.id,
        name: connection.name,
        corpId,
        agentId,
      },
      event: {
        ...eventData,
        corpId,
        agentId,
      },
      processResult,
    };

    const response = await fetch(connection.n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const webhookResponse = await response.text();
    await logSuccess(
      connection.id,
      'n8n_webhook',
      `成功触发 n8n 工作流 (${corpId}/${agentId})`,
      {
        corpId,
        agentId,
        webhookUrl: connection.n8nWebhookUrl,
        response: webhookResponse,
        payload: webhookPayload,
      }
    );
  } catch (error) {
    console.error('触发 n8n 工作流失败:', error);
    await logError(
      connection.id,
      'n8n_webhook',
      `触发 n8n 工作流失败 (${corpId}/${agentId}): ${error instanceof Error ? error.message : String(error)}`,
      {
        corpId,
        agentId,
        webhookUrl: connection.n8nWebhookUrl,
        error: String(error),
      }
    );
  }
}

// 生成回复消息（修改为不自动回复，由n8n处理）
async function generateReplyMessage(
  eventData: any, 
  connection: any, 
  corpId: string, 
  agentId: string
) {
  try {
    // 不再自动回复任何消息，统一由n8n处理
    await logInfo(
      connection.id,
      'reply_message',
      `消息已转发给n8n处理，不进行自动回复 (${corpId}/${agentId}): ${eventData.MsgType}${eventData.Event ? ` - ${eventData.Event}` : ''}`,
      {
        corpId,
        agentId,
        msgType: eventData.MsgType,
        event: eventData.Event,
        fromUser: eventData.FromUserName,
        content: eventData.Content || eventData.Event
      }
    );

    // 返回简单的成功响应，表示消息已接收但不回复
    return new NextResponse('success', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    await logError(
      connection.id,
      'reply_message',
      `处理消息回复逻辑失败 (${corpId}/${agentId}): ${error instanceof Error ? error.message : String(error)}`,
      {
        corpId,
        agentId,
        error: String(error),
      }
    );

    // 即使出错也返回成功响应，避免企业微信重复发送
    return new NextResponse('success', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { corpId, agentId } = params;
  const { searchParams } = new URL(request.url);
  const msg_signature = searchParams.get('msg_signature');
  const timestamp = searchParams.get('timestamp');
  const nonce = searchParams.get('nonce');
  const echostr = searchParams.get('echostr');

  console.log(`接收到企业微信API验证请求: CorpID=${corpId}, AgentID=${agentId}`, { 
    msg_signature, 
    timestamp, 
    nonce, 
    echostr 
  });

  // 验证回调URL的GET请求
  if (echostr && msg_signature && timestamp && nonce) {
    // 查找对应的连接配置
    const connection = await findConnectionByCorpAndAgent(corpId, agentId);
    if (!connection) {
      await logError('system', 'api_verification', `未找到对应的企业微信应用配置 (CorpID: ${corpId}, AgentID: ${agentId})`, {
        corpId,
        agentId,
      });
      return new NextResponse('Connection not found', { status: 404 });
    }

    try {
      // 使用 wxcrypt 进行签名验证和解密
      const wxBizMsgCrypt = new WXBizMsgCrypt(connection.token, connection.encodingAESKey, corpId);
      const decryptedEchoStr = wxBizMsgCrypt.verifyURL(msg_signature, timestamp, nonce, echostr);
      
      await logSuccess(
        connection.id,
        'api_verification',
        `企业微信接口验证成功 (CorpID: ${corpId}, AgentID: ${agentId})`,
        {
          corpId,
          agentId,
          msg_signature,
          timestamp,
          nonce,
        }
      );

      return new NextResponse(decryptedEchoStr, { 
        status: 200, 
        headers: { 'Content-Type': 'text/plain' } 
      });
    } catch (error) {
      await logError(
        connection.id,
        'api_verification',
        `企业微信接口验证失败: ${error instanceof Error ? error.message : String(error)}`,
        {
          corpId,
          agentId,
          error: String(error),
        }
      );
      return new NextResponse('Verification failed', { status: 401 });
    }
  }

  return NextResponse.json({ 
    message: `准备接收企业微信事件 (CorpID: ${corpId}, AgentID: ${agentId})。请发送POST请求以传递消息，或使用GET请求进行接口验证。`,
    corpId,
    agentId
  }, { status: 200 });
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { corpId, agentId } = params;
  
  try {
    const body = await request.text();
    const urlParams = new URL(request.url).searchParams;
    const msgSignature = urlParams.get('msg_signature');
    const timestamp = urlParams.get('timestamp');
    const nonce = urlParams.get('nonce');

    console.log(`接收到企业微信事件回调: CorpID=${corpId}, AgentID=${agentId}`, {
      msgSignature: msgSignature,
      timestamp: timestamp,
      nonce: nonce,
      bodyLength: body.length,
    });

    if (!validateRequestParams(msgSignature, timestamp, nonce)) {
      await logError('system', 'api_call', `企业微信回调参数缺失 (CorpID: ${corpId}, AgentID: ${agentId})`, {
        corpId,
        agentId,
        msgSignature: !!msgSignature,
        timestamp: !!timestamp,
        nonce: !!nonce,
      });
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // 查找对应的连接配置
    const connection = await findConnectionByCorpAndAgent(corpId, agentId);
    if (!connection) {
      await logError('system', 'api_call', `未找到对应的企业微信应用配置 (CorpID: ${corpId}, AgentID: ${agentId})`, {
        corpId,
        agentId,
      });
      return new NextResponse('Connection not found', { status: 404 });
    }

    // 解密和解析消息
    const eventData = await decryptAndParseMessage(
      connection, 
      msgSignature!, 
      timestamp!, 
      nonce!, 
      body, 
      corpId, 
      agentId
    );

    // 处理消息
    const processResult = await processMessage(eventData, connection, corpId, agentId);

    // 触发 n8n webhook
    await triggerN8nWebhook(connection, eventData, processResult, corpId, agentId);

    // 生成并返回回复消息
    return await generateReplyMessage(eventData, connection, corpId, agentId);

  } catch (error) {
    console.error(`处理企业微信回调失败 (${corpId}/${agentId}):`, error);
    await logError('system', 'api_call', `处理企业微信回调失败 (${corpId}/${agentId}): ${error instanceof Error ? error.message : String(error)}`, {
      corpId,
      agentId,
      error: String(error),
    });
    
    // 检查是否为解密失败错误
    const statusCode = (error as any)?.statusCode || 500;
    const message = statusCode === 400 ? 'Message decryption failed' : 'Internal Server Error';
    
    return new NextResponse(message, { status: statusCode });
  }
} 