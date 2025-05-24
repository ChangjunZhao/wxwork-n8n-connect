"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { EventLog } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { History, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EventLogTableProps {
  logs: EventLog[];
}

const getStatusText = (status: EventLog['status']): string => {
  switch (status) {
    case 'Success': return '成功';
    case 'Error': return '错误';
    case 'Processing': return '处理中';
    case 'Info': return '信息';
    default: return status; 
  }
};

const StatusBadge = ({ status }: { status: EventLog['status'] }) => {
  const statusText = getStatusText(status);
  switch (status) {
    case 'Success':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">{statusText}</Badge>;
    case 'Error':
      return <Badge variant="destructive">{statusText}</Badge>;
    case 'Processing':
      return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white">{statusText}</Badge>;
    case 'Info':
      return <Badge variant="outline" className="border-sky-500 text-sky-700">{statusText}</Badge>;
    default:
      return <Badge variant="outline">{statusText}</Badge>;
  }
};

const LogDetails = ({ log }: { log: EventLog }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">时间</h4>
          <p>{new Date(log.timestamp).toLocaleString('zh-CN')}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">状态</h4>
          <StatusBadge status={log.status} />
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">应用名称</h4>
          <p>{log.connection.name}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">事件类型</h4>
          <p>{log.eventType}</p>
        </div>
        {log.connection.corpId && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">企业ID</h4>
            <p>{log.connection.corpId}</p>
          </div>
        )}
        {log.connection.agentId && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">应用ID</h4>
            <p>{log.connection.agentId}</p>
          </div>
        )}
      </div>
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">详情</h4>
        <p className="mt-1 whitespace-pre-wrap">{log.details}</p>
      </div>
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">元数据</h4>
          <pre className="mt-1 p-2 bg-muted rounded-md overflow-auto text-sm">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export function EventLogTable({ logs }: EventLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <History className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">暂无事件日志</h3>
        <p className="text-sm text-muted-foreground">
          收到来自您的企业微信应用的事件后，会在此处显示。
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border shadow-sm">
      <ScrollArea className="w-full whitespace-nowrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">时间戳</TableHead>
              <TableHead className="w-[200px]">应用名称</TableHead>
              <TableHead className="w-[150px]">事件类型</TableHead>
              <TableHead className="w-[120px]">状态</TableHead>
              <TableHead>详情</TableHead>
              <TableHead className="w-[80px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: zhCN })}
                </TableCell>
                <TableCell className="font-medium">{log.connection.name}</TableCell>
                <TableCell>{log.eventType}</TableCell>
                <TableCell>
                  <StatusBadge status={log.status} />
                </TableCell>
                <TableCell className="max-w-md truncate" title={log.details}>
                  {log.details}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">查看详情</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>日志详情</DialogTitle>
                      </DialogHeader>
                      <LogDetails log={log} />
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
