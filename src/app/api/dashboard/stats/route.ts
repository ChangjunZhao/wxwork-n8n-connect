import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 获取活动连接数量
    const activeConnections = await prisma.weixinConnection.count();

    // 获取今日事件数量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayEvents = await prisma.eventLog.count({
      where: {
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // 获取过去一小时的事件数量
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentEvents = await prisma.eventLog.count({
      where: {
        timestamp: {
          gte: oneHourAgo,
        },
      },
    });

    // 获取过去一小时的错误事件数量
    const recentErrors = await prisma.eventLog.count({
      where: {
        timestamp: {
          gte: oneHourAgo,
        },
        status: "error",
      },
    });

    // 计算总事件数量
    const totalEvents = await prisma.eventLog.count();

    return NextResponse.json({
      activeConnections,
      todayEvents,
      recentEvents,
      recentErrors,
      totalEvents,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("获取仪表盘统计数据失败:", error);
    return NextResponse.json(
      { error: "获取统计数据失败" },
      { status: 500 }
    );
  }
} 