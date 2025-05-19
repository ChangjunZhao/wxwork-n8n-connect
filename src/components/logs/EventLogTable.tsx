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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { History } from "lucide-react";

interface EventLogTableProps {
  logs: EventLog[];
}

const StatusBadge = ({ status }: { status: EventLog['status'] }) => {
  switch (status) {
    case 'Success':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white capitalize">{status}</Badge>;
    case 'Error':
      return <Badge variant="destructive" className="capitalize">{status}</Badge>;
    case 'Processing':
      return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white capitalize">{status}</Badge>;
    case 'Info':
      return <Badge variant="outline" className="border-sky-500 text-sky-700 capitalize">{status}</Badge>;
    default:
      return <Badge variant="outline" className="capitalize">{status}</Badge>;
  }
};


export function EventLogTable({ logs }: EventLogTableProps) {
   if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <History className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">No Event Logs Available</h3>
        <p className="text-sm text-muted-foreground">
          Events from your Weixin Work applications will appear here once received.
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
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[200px]">App Name</TableHead>
              <TableHead className="w-[150px]">Event Type</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
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
