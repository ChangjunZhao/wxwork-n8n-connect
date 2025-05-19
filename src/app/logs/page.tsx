"use client";
import { useState, useEffect } from 'react';
import { EventLogTable } from "@/components/logs/EventLogTable";
import { initialEventLogs } from "@/lib/mockData";
import type { EventLog } from "@/lib/types";
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';

export default function EventLogsPage() {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching logs
    setTimeout(() => {
      const sortedLogs = [...initialEventLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(sortedLogs);
      setIsLoading(false);
    }, 500); // Simulate network delay
  }, []);

  const handleRefreshLogs = () => {
    setIsLoading(true);
    // Simulate re-fetching logs
    setTimeout(() => {
       // In a real app, you'd fetch new data. Here we just re-sort potentially updated mock data or add a new mock entry.
       // For demo, let's just re-set with a slight modification or re-sort.
      const newMockLog: EventLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        connectionName: 'System Monitor',
        eventType: 'refresh_logs',
        status: 'Info',
        details: 'Logs refreshed manually.',
      };
      const updatedLogs = [newMockLog, ...logs].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20); // Keep it to 20 logs for demo
      setLogs(updatedLogs);
      setIsLoading(false);
    }, 500);
  };
  
  const handleDownloadLogs = () => {
    // Basic CSV download for example
    const headers = "ID,Timestamp,Connection Name,Event Type,Status,Details\n";
    const csvContent = logs.map(log => 
      `${log.id},${log.timestamp},"${log.connectionName.replace(/"/g, '""')}","${log.eventType.replace(/"/g, '""')}",${log.status},"${log.details.replace(/"/g, '""')}"`
    ).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "event_logs.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Event Logs</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleDownloadLogs} disabled={logs.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Download Logs
          </Button>
          <Button onClick={handleRefreshLogs} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Logs'}
          </Button>
        </div>
      </div>
      
      {isLoading && logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <RefreshCw className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading logs...</p>
        </div>
      ) : (
        <EventLogTable logs={logs} />
      )}
    </div>
  );
}
