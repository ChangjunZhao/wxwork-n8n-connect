import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <ExternalLink className="mr-2 h-4 w-4" />
            View n8n Docs
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhook URL</CardTitle>
            <Lightbulb className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold break-all">/api/weixin/callback</div>
            <p className="text-xs text-muted-foreground">
              Configure this URL in your Weixin Work App.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Currently configured Weixin App connections.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Today</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125</div>
            <p className="text-xs text-muted-foreground">
              +10 since last hour (2 errors)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to connect your Weixin Work application and start triggering workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">1. Configure a Connection</h3>
            <p className="text-sm text-muted-foreground">
              Go to the <Link href="/connections" className="text-primary hover:underline">Connections</Link> page and add your Weixin App details (CorpID, AgentID, Token, EncodingAESKey).
            </p>
          </div>
          <div>
            <h3 className="font-semibold">2. Set Webhook in Weixin Work</h3>
            <p className="text-sm text-muted-foreground">
              In your Weixin Work Admin Console, find your application and set the "Receiving messages" URL to the Webhook URL shown above. Ensure to use the Token and EncodingAESKey you configured.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">3. Test Your Setup</h3>
            <p className="text-sm text-muted-foreground">
              Send a message to your Weixin Work App or trigger an event. Check the <Link href="/logs" className="text-primary hover:underline">Event Logs</Link> page to see if the event was received.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
