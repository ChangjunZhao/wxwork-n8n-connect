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
import { MoreHorizontal, Edit, Trash2, PlugZap, CheckCircle2, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WeixinConnection } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface ConnectionTableProps {
  connections: WeixinConnection[];
  onEdit: (connection: WeixinConnection) => void;
  onDelete: (connectionId: string) => void;
}

export function ConnectionTable({ connections, onEdit, onDelete }: ConnectionTableProps) {
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
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>应用名称</TableHead>
            <TableHead>企业ID</TableHead>
            <TableHead>应用ID</TableHead>
            <TableHead>n8n Webhook</TableHead>
            <TableHead className="w-[80px] text-right">操作</TableHead>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">操作</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(conn)}>
                      <Edit className="mr-2 h-4 w-4" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(conn.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
