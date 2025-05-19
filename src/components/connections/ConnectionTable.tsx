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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WeixinConnection } from "@/lib/types";

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
        <h3 className="text-xl font-semibold">No Connections Yet</h3>
        <p className="text-sm text-muted-foreground">
          Add your first Weixin Work application connection to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>App Name</TableHead>
            <TableHead>CorpID</TableHead>
            <TableHead>AgentID</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {connections.map((conn) => (
            <TableRow key={conn.id}>
              <TableCell className="font-medium">{conn.name}</TableCell>
              <TableCell>{conn.corpId}</TableCell>
              <TableCell>{conn.agentId}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(conn)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(conn.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
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
// Placeholder for PlugZap icon if not already imported
import { PlugZap } from 'lucide-react';
