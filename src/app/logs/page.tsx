"use client";

import { useState, useEffect } from 'react';
import { EventLogTable } from "@/components/logs/EventLogTable";
import { LogFilters, type LogFilters as LogFiltersType } from "@/components/logs/LogFilters";
import { LogPagination } from "@/components/logs/LogPagination";
import type { EventLog, LogsResponse } from "@/lib/types";
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function EventLogsPage() {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });
  const [filters, setFilters] = useState<LogFiltersType>({});
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.eventType && { eventType: filters.eventType }),
        ...(filters.connectionId && { connectionId: filters.connectionId }),
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && { startDate: filters.startDate.toISOString() }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString() }),
      });

      const response = await fetch(`/api/logs?${queryParams}`);
      if (!response.ok) throw new Error('获取日志失败');
      
      const data: LogsResponse = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('获取日志失败:', error);
      toast({
        title: "错误",
        description: "获取日志失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, pagination.limit]);

  const handleRefreshLogs = () => {
    fetchLogs();
  };

  const handleFilter = (newFilters: LogFiltersType) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    // 触发 fetchLogs 会在下一个 useEffect 中执行
    setTimeout(fetchLogs, 0);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  const handleDownloadLogs = async () => {
    try {
      const queryParams = new URLSearchParams({
        limit: '1000', // 下载更多日志
        ...(filters.status && { status: filters.status }),
        ...(filters.eventType && { eventType: filters.eventType }),
        ...(filters.connectionId && { connectionId: filters.connectionId }),
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && { startDate: filters.startDate.toISOString() }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString() }),
      });

      const response = await fetch(`/api/logs?${queryParams}`);
      if (!response.ok) throw new Error('获取日志失败');
      
      const data: LogsResponse = await response.json();
      
      const headers = "ID,时间戳,应用名称,事件类型,状态,详情\n";
      const csvContent = data.logs.map(log => 
        `${log.id},${log.timestamp},"${log.connection.name.replace(/"/g, '""')}","${log.eventType.replace(/"/g, '""')}",${log.status},"${log.details.replace(/"/g, '""')}"`
      ).join("\n");
      
      const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `event_logs_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "成功",
        description: `已导出 ${data.logs.length} 条日志`,
      });
    } catch (error) {
      console.error('下载日志失败:', error);
      toast({
        title: "错误",
        description: "下载日志失败，请稍后重试",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">事件日志</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleDownloadLogs} disabled={logs.length === 0 || isLoading}>
            <Download className="mr-2 h-4 w-4" />
            下载日志
          </Button>
          <Button onClick={handleRefreshLogs} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? '刷新中...' : '刷新日志'}
          </Button>
        </div>
      </div>

      <LogFilters onFilter={handleFilter} isLoading={isLoading} />
      
      {isLoading && logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <RefreshCw className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">正在加载日志...</p>
        </div>
      ) : (
        <>
          <EventLogTable logs={logs} />
          {pagination.total > 0 && (
            <LogPagination
              pagination={pagination}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              isLoading={isLoading}
            />
          )}
        </>
      )}
    </div>
  );
}
