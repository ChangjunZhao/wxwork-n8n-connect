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
import { zhCN } from 'date-fns/locale'; // Import Chinese locale
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { History } from "lucide-react";

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: zhCN })}
                </TableCell>
                <TableCell className="font-medium">{log.connectionName}</TableCell>
                <TableCell>{log.eventType}</TableCell>
                <TableCell>
                  <StatusBadge status={log.status} />
                </TableCell>
                <TableCell className="max-w-md truncate" title={log.details}>{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
