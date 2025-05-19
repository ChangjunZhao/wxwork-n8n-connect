import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { WeixinConnection } from '@/lib/types'; // 假设类型文件路径

// TODO: 在实际应用中，需要从数据库或其他服务器端可访问的存储中获取连接信息。
// localStorage 仅限浏览器环境，API路由无法访问。
// 以下函数仅为示例，你需要替换为真实的异步数据获取逻辑。
async function getConnectionsFromServer(): Promise<WeixinConnection[]> {
  // 这是一个占位符。在实际应用中，您可能需要:
  // 1. 从数据库（如 Firestore, PostgreSQL 等）查询。
  // 2. 从一个 JSON 文件或其他服务器端存储读取（不推荐用于生产环境的敏感数据）。
  // 暂时返回一个空数组或示例数据，以避免编译错误。
  // console.warn("API Route: getConnectionsFromServer is a placeholder and needs to be implemented to fetch connections from a server-side store.");
  // 示例：如果您有一个JSON文件存储连接（不推荐生产环境）：
  // import fs from 'fs/promises';
  // import path from 'path';
  // try {
  //   const filePath = path.join(process.cwd(), 'data', 'connections.json');
  //   const jsonData = await fs.readFile(filePath, 'utf-8');
  //   return JSON.parse(jsonData);
  // } catch (error) {
  //   console.error("Failed to load connections from server store:", error);
  //   return [];
  // }
  return []; // 必须返回 Promise<WeixinConnection[]>
}

// TODO: 引入 XML 解析库，例如 'xml2js' 或 'fast-xml-parser'
// import { parseStringPromise } from 'xml2js'; // 示例

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const msg_signature = searchParams.get('msg_signature');
  const timestamp = searchParams.get('timestamp');
  const nonce = searchParams.get('nonce');
  const echostr = searchParams.get('echostr');

  // TODO: 实现实际的企业微信签名验证
  // 例如: verify_signature(token_from_matching_connection, timestamp, nonce, echostr)
  if (echostr && msg_signature && timestamp && nonce) {
    console.log('接收到企业微信API验证请求:', { msg_signature, timestamp, nonce, echostr });
    // 验证逻辑应该基于与请求参数（如CorpID, AgentID，如果能从验证请求中获取的话）匹配的连接的Token。
    // 由于GET请求通常不包含CorpID/AgentID，此处的验证可能需要一个通用的验证Token，或企业微信允许的其他验证方式。
    // 企业微信的验证通常是针对特定应用的，因此需要某种方式确定是哪个应用在进行验证。
    // 如果 echostr 存在，说明是首次配置URL的验证请求。
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

    // TODO: 实现实际的企业微信签名验证和消息解密（如果加密）。
    // 验证和解密过程需要使用特定连接的 Token 和 EncodingAESKey。
    // 这意味着首先需要从 rawBody (XML) 中解析出 CorpID (ToUserName) 和 AgentID，
    // 然后根据这些标识找到对应的连接配置。

    // --- 1. 从服务器获取所有连接配置 ---
    // const connections = await getConnectionsFromServer(); // 需要真实实现
    // console.log(`API Route: Loaded ${connections.length} connections from server store.`);

    // --- 2. 解析XML以获取 CorpID (ToUserName) 和 AgentID ---
    let parsedXml: any; // XML解析后的对象
    let requestCorpId: string | undefined;
    let requestAgentId: string | undefined;

    // 示例: 使用 xml2js (需要 npm install xml2js)
    // try {
    //   parsedXml = await parseStringPromise(rawBody, { explicitArray: false, trim: true });
    //   requestCorpId = parsedXml.xml?.ToUserName; // CorpID 通常是 ToUserName
    //   requestAgentId = parsedXml.xml?.AgentID;   // AgentID
    //   console.log('API Route: Parsed XML. CorpID:', requestCorpId, 'AgentID:', requestAgentId);
    // } catch (parseError) {
    //   console.error('API Route: XML 解析失败:', parseError);
    //   return new NextResponse('XML parsing error', { status: 400 });
    // }

    // if (!requestCorpId || !requestAgentId) {
    //   console.error('API Route: 无法从XML中解析出 CorpID 或 AgentID');
    //   return new NextResponse('Missing CorpID or AgentID in XML payload', { status: 400 });
    // }

    // --- 3. 查找匹配的连接 ---
    // const matchedConnection = connections.find(
    //   conn => conn.corpId === requestCorpId && conn.agentId === requestAgentId
    // );

    // if (!matchedConnection) {
    //   console.warn(`API Route: 未找到与 CorpID '${requestCorpId}' 和 AgentID '${requestAgentId}' 匹配的连接配置。`);
    //   // 根据企业微信的要求，即使没有找到匹配的连接或处理失败，也可能需要返回 "success" 或空响应，以避免重试。
    //   // 但这里为了调试方便，可以先返回错误。
    //   return new NextResponse('No matching connection configured', { status: 404 });
    // }
    // console.log(`API Route: 找到匹配连接: ${matchedConnection.name}`);

    // --- TODO: 实际的签名验证和消息解密 ---
    // 使用 matchedConnection.token 和 matchedConnection.encodingAESKey
    // if (!verify_signature(matchedConnection.token, timestamp, nonce, encrypted_message_from_body)) {
    //   return new NextResponse('Signature verification failed', { status: 401 });
    // }
    // const decrypted_xml = decrypt_message(matchedConnection.encodingAESKey, encrypted_message_from_body);
    // const final_parsed_event = parse_xml(decrypted_xml);


    // --- 4. 如果配置了 n8n Webhook URL，则调用它 ---
    // if (matchedConnection.n8nWebhookUrl) {
    //   console.log(`API Route: 正在向 n8n Webhook URL 发送数据: ${matchedConnection.n8nWebhookUrl}`);
    //   try {
    //     const n8nResponse = await fetch(matchedConnection.n8nWebhookUrl, {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' }, // 或者 'application/xml' 如果n8n期望接收XML
    //       body: JSON.stringify(parsedXml.xml), // 发送解析后的XML内容，或原始rawBody
    //     });
    //     if (!n8nResponse.ok) {
    //       console.error(`API Route: 调用 n8n Webhook 失败: ${n8nResponse.status} ${n8nResponse.statusText}`, await n8nResponse.text());
    //       // 此处错误不应阻塞对企业微信的 "success" 响应
    //     } else {
    //       console.log('API Route: 成功将数据发送到 n8n Webhook。');
    //     }
    //   } catch (n8nError) {
    //     console.error('API Route: 调用 n8n Webhook 时发生网络错误:', n8nError);
    //     // 此处错误不应阻塞对企业微信的 "success" 响应
    //   }
    // } else {
    //   console.log(`API Route: 连接 ${matchedConnection.name} 未配置 n8n Webhook URL。`);
    // }

    // 对于企业微信，无论内部处理如何，通常都应返回 "success" 或空字符串。
    return new NextResponse('success', { status: 200, headers: { 'Content-Type': 'text/plain' } });

  } catch (error) {
    console.error('处理企业微信回调时出错:', error);
    // 即使出错，也可能需要返回 "success" 以避免企业微信重试。
    // 但为了调试，可以先返回 500。
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
