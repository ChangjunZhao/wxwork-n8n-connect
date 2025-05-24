import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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


interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = params;
  try {
    const connection = await prisma.weixinConnection.findUnique({
      where: { id },
    });
    if (!connection) {
      return NextResponse.json({ message: "连接未找到" }, { status: 404 });
    }
    return NextResponse.json(connection);
  } catch (error) {
    console.error(`获取连接 ${id} 失败:`, error);
    return NextResponse.json({ message: "获取连接失败" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = params;
  try {
    const body = await request.json();
    const validation = connectionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "数据校验失败", errors: validation.error.errors }, { status: 400 });
    }
    
    const { name, corpId, agentId, token, encodingAESKey, n8nWebhookUrl } = validation.data;

    const updatedConnection = await prisma.weixinConnection.update({
      where: { id },
      data: {
        name,
        corpId,
        agentId,
        token,
        encodingAESKey,
        n8nWebhookUrl: n8nWebhookUrl || null,
      },
    });
    return NextResponse.json(updatedConnection);
  } catch (error: any) {
    console.error(`更新连接 ${id} 失败:`, error);
     if (error.code === 'P2002' && error.meta?.target?.includes('corpId_agentId_unique_constraint')) {
         return NextResponse.json({ message: "更新连接失败：具有相同企业ID和应用ID的连接已存在。" }, { status: 409 });
    }
    if (error.code === 'P2025') { // Record to update not found
        return NextResponse.json({ message: "连接未找到，无法更新" }, { status: 404 });
    }
    return NextResponse.json({ message: "更新连接失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = params;
  try {
    // 使用事务确保数据一致性
    await prisma.$transaction(async (tx) => {
      // 先删除所有相关的事件日志
      await tx.eventLog.deleteMany({
        where: {
          connectionId: id
        }
      });
      
      // 然后删除连接
      await tx.weixinConnection.delete({
        where: { id },
      });
    });
    
    return NextResponse.json({ message: "连接已删除" }, { status: 200 });
  } catch (error: any) {
    console.error(`删除连接 ${id} 失败:`, error);
    if (error.code === 'P2025') { // Record to delete not found
        return NextResponse.json({ message: "连接未找到，无法删除" }, { status: 404 });
    }
    return NextResponse.json({ message: "删除连接失败" }, { status: 500 });
  }
}
