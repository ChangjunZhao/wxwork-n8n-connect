import { WebSocketServer, WebSocket } from "ws";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 创建 WebSocket 服务器实例
const wss = new WebSocketServer({ noServer: true });

// 存储所有连接的客户端
const clients = new Set<WebSocket>();

// 处理新的 WebSocket 连接
wss.on("connection", (ws: WebSocket) => {
  clients.add(ws);
  console.log("新的 WebSocket 连接建立");

  ws.on("close", () => {
    clients.delete(ws);
    console.log("WebSocket 连接关闭");
  });

  ws.on("error", (error: Error) => {
    console.error("WebSocket 错误:", error);
    clients.delete(ws);
  });
});

// 广播消息给所有连接的客户端
export function broadcast(message: any) {
  const messageStr = JSON.stringify(message);
  console.log(`向 ${clients.size} 个客户端广播消息:`, message);
  
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(messageStr);
      } catch (error) {
        console.error("发送消息失败:", error);
        clients.delete(client);
      }
    } else {
      clients.delete(client);
    }
  });
}

// 处理 WebSocket 升级请求
export async function GET(request: NextRequest) {
  const upgrade = request.headers.get("upgrade");

  if (upgrade?.toLowerCase() !== "websocket") {
    return new NextResponse("Expected Upgrade: websocket", { status: 426 });
  }

  try {
    // 注意：Next.js 的 WebSocket 支持可能有限制
    // 这是一个基础实现，生产环境可能需要使用专门的 WebSocket 服务
    return new NextResponse("WebSocket upgrade not fully supported in this environment", { 
      status: 501,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("WebSocket 升级失败:", error);
    return new NextResponse("WebSocket upgrade failed", { status: 500 });
  }
}
