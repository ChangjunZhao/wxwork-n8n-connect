import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import Link from "next/link";

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhook 地址</CardTitle>
            <Lightbulb className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold break-all">/api/weixin/callback</div>
            <p className="text-xs text-muted-foreground">
              在您的企业微信应用中配置此 URL。
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活动连接</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              当前已配置的企业微信应用连接。
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日事件</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125</div>
            <p className="text-xs text-muted-foreground">
              过去一小时新增 10 (2 个错误)
            </p>
          </CardContent>
        </Card>
      </div>

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
            <h3 className="font-semibold">2. 在企业微信中设置 Webhook</h3>
            <p className="text-sm text-muted-foreground">
              在您的企业微信管理后台，找到您的应用并将“接收消息”URL 设置为上面显示的 Webhook 地址。请确保使用您配置的 Token 和 EncodingAESKey。
            </p>
          </div>
          <div>
            <h3 className="font-semibold">3. 测试您的设置</h3>
            <p className="text-sm text-muted-foreground">
              向您的企业微信应用发送消息或触发事件。检查 <Link href="/logs" className="text-primary hover:underline">事件日志</Link> 页面以查看事件是否已接收。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
