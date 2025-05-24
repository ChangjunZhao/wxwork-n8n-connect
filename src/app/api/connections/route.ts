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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 分页参数
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;
    
    // 搜索参数
    const search = searchParams.get('search')?.trim() || '';
    const hasN8nWebhook = searchParams.get('hasN8nWebhook');
    
    // 构建查询条件
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { corpId: { contains: search } },
        { agentId: { contains: search } },
      ];
    }
    
    if (hasN8nWebhook === 'true') {
      where.n8nWebhookUrl = { not: null };
    } else if (hasN8nWebhook === 'false') {
      where.n8nWebhookUrl = null;
    }
    
    // 获取总数和分页数据
    const [total, connections] = await prisma.$transaction([
      prisma.weixinConnection.count({ where }),
      prisma.weixinConnection.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      connections,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("获取连接列表失败:", error);
    return NextResponse.json({ 
      message: "获取连接列表失败", 
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined 
    }, { status: 500 });
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
