
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { WeixinConnection } from '@/lib/types';
import { z } from 'zod';

// Zod schema for validation
const connectionSchema = z.object({
  name: z.string().min(1, "应用名称不能为空"),
  corpId: z.string().min(1, "企业ID不能为空"),
  agentId: z.string().min(1, "应用ID不能为空"),
  token: z.string().min(1, "令牌不能为空"),
  encodingAESKey: z.string().length(43, "消息加解密密钥必须是43位"),
  n8nWebhookUrl: z.string().url("请输入有效的 n8n Webhook URL。").optional().nullable(),
});

export async function GET() {
  try {
    const connections = await prisma.weixinConnection.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(connections);
  } catch (error) {
    console.error("获取连接列表失败:", error);
    return NextResponse.json({ message: "获取连接列表失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = connectionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "数据校验失败", errors: validation.error.errors }, { status: 400 });
    }

    const { name, corpId, agentId, token, encodingAESKey, n8nWebhookUrl } = validation.data;

    const newConnection = await prisma.weixinConnection.create({
      data: {
        name,
        corpId,
        agentId,
        token,
        encodingAESKey,
        n8nWebhookUrl: n8nWebhookUrl || null, // Ensure null if empty/undefined
      },
    });
    return NextResponse.json(newConnection, { status: 201 });
  } catch (error: any) {
    console.error("创建连接失败:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('corpId_agentId_unique_constraint')) {
         return NextResponse.json({ message: "创建连接失败：具有相同企业ID和应用ID的连接已存在。" }, { status: 409 });
    }
    return NextResponse.json({ message: "创建连接失败" }, { status: 500 });
  }
}
