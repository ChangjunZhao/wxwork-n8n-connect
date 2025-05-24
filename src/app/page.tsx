import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { DashboardStats } from "@/components/dashboard/DashboardStats";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">仪表盘</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <ExternalLink className="mr-2 h-4 w-4" />
            查看 n8n 文档
          </Button>
        </div>
      </div>

      {/* 实时统计数据 */}
      <DashboardStats />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>快速入门</CardTitle>
          <CardDescription>
            请按照以下步骤连接您的企业微信应用并开始触发工作流。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">1. 配置连接</h3>
            <p className="text-sm text-muted-foreground">
              前往 <Link href="/connections" className="text-primary hover:underline">连接管理</Link> 页面并添加您的企业微信应用详情 (CorpID, AgentID, Token, EncodingAESKey)。
            </p>
          </div>
          <div>
            <h3 className="font-semibold">2. 复制回调地址</h3>
            <p className="text-sm text-muted-foreground">
              在连接管理页面，点击"复制企微回调地址"获取专属的回调URL，然后在企业微信管理后台设置"接收消息"URL。
            </p>
          </div>
          <div>
            <h3 className="font-semibold">3. 配置 n8n Webhook（可选）</h3>
            <p className="text-sm text-muted-foreground">
              如需将企业微信事件转发到 n8n 工作流，请在连接配置中填入 n8n Webhook URL。
            </p>
            <div className="mt-2 p-3 bg-muted rounded-md">
              <h4 className="text-xs font-medium mb-1">n8n Webhook 配置参数：</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <span className="font-medium">请求方式：</span>POST</li>
                <li>• <span className="font-medium">认证方式：</span>None</li>
                <li>• <span className="font-medium">内容类型：</span>application/json</li>
              </ul>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">4. 测试您的设置</h3>
            <p className="text-sm text-muted-foreground">
              向您的企业微信应用发送消息或触发事件。检查 <Link href="/logs" className="text-primary hover:underline">事件日志</Link> 页面以查看事件是否已接收。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

