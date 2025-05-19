
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma'; // 引入 Prisma Client
// TODO: 引入 XML 解析库，例如 'xml2js' 或 'fast-xml-parser' 和企业微信加解密库
// import { WXBizMsgCrypt } from 'wechat-crypto'; // 示例：一个可能的加解密库
// import { parseStringPromise } from 'xml2js';

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const msg_signature = searchParams.get('msg_signature');
  const timestamp = searchParams.get('timestamp');
  const nonce = searchParams.get('nonce');
  const echostr = searchParams.get('echostr');

  // TODO: 企业微信的 GET 请求验证通常需要 CorpID 和 AgentID 来找到对应的 Token。
  // 这些参数可能不在 GET 请求的 URL 中，企业微信的文档说明了验证方式。
  // 您可能需要一个通用的验证接口或调整此逻辑。
  // 暂时，如果 echostr 存在，直接返回。在实际场景中，这需要严格的签名验证。
  if (echostr && msg_signature && timestamp && nonce) {
    console.log('接收到企业微信API验证请求:', { msg_signature, timestamp, nonce, echostr });
    // 示例: 假设您能从请求中某种方式获取到 corpId 和 agentId, 或者使用一个固定的验证token
    // const tempCorpId = searchParams.get('corpid'); // 这只是示例，企业微信验证GET请求可能不直接带这些
    // const tempAgentId = searchParams.get('agentid');
    // if (tempCorpId && tempAgentId) {
    //   const connection = await findConnectionByCorpAndAgent(tempCorpId, tempAgentId);
    //   if (connection) {
    //     // const crypt = new WXBizMsgCrypt(connection.token, connection.encodingAESKey, connection.corpId);
    //     // try {
    //     //   const decryptedEchoStr = crypt.verifyURL(msg_signature, timestamp, nonce, echostr);
    //     //   return new NextResponse(decryptedEchoStr, { status: 200, headers: { 'Content-Type': 'text/plain' } });
    //     // } catch (e) {
    //     //   console.error("企业微信 GET 验证解密失败:", e);
    //     //   return new NextResponse('Verification failed', { status: 401 });
    //     // }
    //      return new NextResponse(echostr, { status: 200, headers: { 'Content-Type': 'text/plain' } }); // 简化处理，实际应解密验证
    //   }
    // }
    // 简化处理：如果 echostr 存在，直接返回。实际生产中需要严格验证签名。
    return new NextResponse(echostr, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  return NextResponse.json({ message: '准备接收企业微信事件。请发送POST请求以传递消息，或使用GET请求进行接口验证。' }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const msg_signature = searchParams.get('msg_signature');
  const timestamp = searchParams.get('timestamp');
  const nonce = searchParams.get('nonce');

  try {
    const rawBody = await request.text(); // 企业微信发送XML
    console.log('接收到企业微信POST请求头:', Object.fromEntries(request.headers));
    console.log('接收到企业微信POST请求查询参数:', { msg_signature, timestamp, nonce });
    console.log('接收到企业微信POST请求体 (原始):', rawBody);

    // --- TODO: 1. 解析XML以获取 CorpID (ToUserName) 和 AgentID ---
    // 您需要选择一个XML解析库 (例如 xml2js, fast-xml-parser) 并安装它。
    // 例如: const parsedXml = await parseStringPromise(rawBody, { explicitArray: false, trim: true });
    // const requestCorpId = parsedXml?.xml?.ToUserName; // CorpID 通常是 ToUserName
    // const requestAgentId = parsedXml?.xml?.AgentID;   // AgentID (如果存在于XML中)
    // const encryptMessage = parsedXml?.xml?.Encrypt; // 加密的消息体

    // 以下为占位符，您需要从解析后的XML中获取这些值
    const requestCorpId: string | undefined = "PLACEHOLDER_CORP_ID"; // 从XML解析
    const requestAgentId: string | undefined = "PLACEHOLDER_AGENT_ID"; // 从XML解析 (可能没有，取决于事件类型)
    const encryptMessage: string | undefined = "PLACEHOLDER_ENCRYPTED_MESSAGE"; // 从XML解析

    if (!requestCorpId /* || !requestAgentId - AgentID 可能不存在于某些消息类型，需谨慎处理 */) {
      console.error('API Route: 无法从XML中解析出 CorpID (ToUserName)');
      // 企业微信要求成功响应，即使处理失败，避免重试风暴
      return new NextResponse('success', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }
    
    // --- 2. 查找匹配的连接配置 ---
    // AgentID 可能不是所有消息类型都有，如果您的应用不区分AgentID，可以只用CorpID查找，或者有默认AgentID
    // 对于需要AgentID的场景，请确保XML中有此字段或有其他方式确定。
    const matchedConnection = await findConnectionByCorpAndAgent(requestCorpId, requestAgentId || "DEFAULT_AGENT_ID_IF_APPLICABLE");

    if (!matchedConnection) {
      console.warn(`API Route: 未找到与 CorpID '${requestCorpId}' 和 AgentID '${requestAgentId || "N/A"}' 匹配的连接配置。`);
      return new NextResponse('success', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }
    console.log(`API Route: 找到匹配连接: ${matchedConnection.name}`);

    // --- TODO: 3. 实际的签名验证和消息解密 ---
    // if (!msg_signature || !timestamp || !nonce || !encryptMessage) {
    //   console.error("API Route: 签名或加密消息参数缺失");
    //   return new NextResponse('success', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    // }
    // const crypt = new WXBizMsgCrypt(matchedConnection.token, matchedConnection.encodingAESKey, matchedConnection.corpId);
    // let decryptedXmlMessage: string;
    // try {
    //   decryptedXmlMessage = crypt.decryptMsg(msg_signature, timestamp, nonce, encryptMessage).message;
    //   console.log('API Route: 解密后的消息:', decryptedXmlMessage);
    // } catch (e) {
    //   console.error('API Route: 消息解密失败:', e);
    //   return new NextResponse('success', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    // }
    // const finalParsedEvent = await parseStringPromise(decryptedXmlMessage, { explicitArray: false, trim: true });
    // console.log('API Route: 最终解析事件:', finalParsedEvent);
    
    // 假设解密和解析后的事件对象为 finalParsedEvent.xml

    // --- 4. 如果配置了 n8n Webhook URL，则调用它 ---
    if (matchedConnection.n8nWebhookUrl) {
      console.log(`API Route: 正在向 n8n Webhook URL 发送数据: ${matchedConnection.n8nWebhookUrl}`);
      try {
        // TODO: 确定是发送原始加密XML、解密后XML还是解析后的JSON对象到n8n
        // 以下示例发送解析后的对象 (假设 finalParsedEvent 存在且包含所需数据)
        // const dataToSendToN8n = finalParsedEvent?.xml || rawBody; // 根据您的n8n Webhook期望的格式调整
        const dataToSendToN8n = { rawXml: rawBody /* decryptedXml: decryptedXmlMessage, parsedEvent: finalParsedEvent?.xml */ };


        const n8nResponse = await fetch(matchedConnection.n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }, // 通常n8n Webhook接收JSON
          body: JSON.stringify(dataToSendToN8n),
        });
        if (!n8nResponse.ok) {
          console.error(`API Route: 调用 n8n Webhook 失败: ${n8nResponse.status} ${n8nResponse.statusText}`, await n8nResponse.text());
        } else {
          console.log('API Route: 成功将数据发送到 n8n Webhook。');
        }
      } catch (n8nError) {
        console.error('API Route: 调用 n8n Webhook 时发生网络错误:', n8nError);
      }
    } else {
      console.log(`API Route: 连接 ${matchedConnection.name} 未配置 n8n Webhook URL。`);
    }

    // 对于企业微信，无论内部处理如何，通常都应返回 "success" 或空字符串。
    return new NextResponse('success', { status: 200, headers: { 'Content-Type': 'text/plain' } });

  } catch (error) {
    console.error('处理企业微信回调时出错:', error);
    // 即使出错，也可能需要返回 "success" 以避免企业微信重试。
    return new NextResponse('success', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }
}

