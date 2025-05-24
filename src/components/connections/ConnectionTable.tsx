"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, PlugZap, CheckCircle2, XCircle, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WeixinConnection } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ConnectionTableProps {
  connections: WeixinConnection[];
  onEdit: (connection: WeixinConnection) => void;
  onDelete: (connectionId: string) => void;
}

export function ConnectionTable({ connections, onEdit, onDelete }: ConnectionTableProps) {
  const [showCallbackDialog, setShowCallbackDialog] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<WeixinConnection | null>(null);
  const { toast } = useToast();

  // 获取当前站点的 host
  const getCallbackUrl = (connection: WeixinConnection) => {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol;
      const host = window.location.host;
      return `${protocol}//${host}/api/weixin/callback/${connection.corpId}/${connection.agentId}`;
    }
    return `https://yourdomain.com/api/weixin/callback/${connection.corpId}/${connection.agentId}`;
  };

  const handleCopyCallback = (connection: WeixinConnection) => {
    setSelectedConnection(connection);
    setShowCallbackDialog(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      // 首先尝试使用现代的 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast({
          title: "✅ 复制成功",
          description: "回调地址已复制到剪贴板，可以直接粘贴使用",
        });
        return;
      }
      
      // 降级方案：使用传统的 execCommand 方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        toast({
          title: "✅ 复制成功",
          description: "回调地址已复制到剪贴板（兼容模式）",
        });
      } else {
        throw new Error('execCommand copy failed');
      }
    } catch (err) {
      console.error('复制失败:', err);
      toast({
        title: "⚠️ 需要手动复制",
        description: "请点击地址栏选中文本，然后按 Ctrl+C (或 Cmd+C) 复制",
        variant: "destructive",
        duration: 6000, // 延长显示时间
      });
      
      // 作为最后的降级方案，自动选中文本让用户手动复制
      try {
        const input = document.getElementById('callback-url') as HTMLInputElement;
        if (input) {
          input.focus();
          input.select();
          input.setSelectionRange(0, 99999); // 兼容移动设备
        }
      } catch (selectErr) {
        console.error('选中文本失败:', selectErr);
      }
    }
  };

  if (connections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <PlugZap className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">暂无连接</h3>
        <p className="text-sm text-muted-foreground">
          添加您的第一个企业微信应用连接以开始使用。
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>应用名称</TableHead>
              <TableHead>企业ID</TableHead>
              <TableHead>应用ID</TableHead>
              <TableHead>n8n Webhook</TableHead>
              <TableHead className="w-[120px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {connections.map((conn) => (
              <TableRow key={conn.id}>
                <TableCell className="font-medium">{conn.name}</TableCell>
                <TableCell>{conn.corpId}</TableCell>
                <TableCell>{conn.agentId}</TableCell>
                <TableCell>
                  {conn.n8nWebhookUrl ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      已配置
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="mr-1 h-4 w-4" />
                      未配置
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleCopyCallback(conn)}
                      title="复制企微回调地址"
                      className="h-8 w-8"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(conn)}
                      title="编辑"
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(conn.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 复制回调地址对话框 */}
      <Dialog open={showCallbackDialog} onOpenChange={setShowCallbackDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>企业微信回调地址</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedConnection && (
              <>
                <div className="space-y-2">
                  <Label>应用信息</Label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">应用名称：</span>
                      <span className="font-medium">{selectedConnection.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">企业ID：</span>
                      <span className="font-mono">{selectedConnection.corpId}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">应用ID：</span>
                      <span className="font-mono">{selectedConnection.agentId}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="callback-url">回调地址</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="callback-url"
                      value={getCallbackUrl(selectedConnection)}
                      readOnly
                      className="font-mono text-sm"
                      onClick={(e) => {
                        // 点击输入框时自动选中全部文本
                        const target = e.target as HTMLInputElement;
                        target.select();
                      }}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(getCallbackUrl(selectedConnection))}
                      title="复制回调地址到剪贴板"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    在企业微信管理后台的"接收消息设置"中使用此地址。如果复制按钮不工作，可以点击地址栏选中后手动复制 (Ctrl+C / Cmd+C)。
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <h4 className="text-sm font-medium mb-2">配置说明：</h4>
                  <ol className="text-xs space-y-1 text-muted-foreground">
                    <li>1. 复制上方回调地址</li>
                    <li>2. 在企业微信管理后台找到您的应用</li>
                    <li>3. 点击"接收消息" → "设置API接收"</li>
                    <li>4. 粘贴回调地址到 URL 字段</li>
                    <li>5. 填入 Token 和 EncodingAESKey</li>
                    <li>6. 点击保存完成配置</li>
                  </ol>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
