"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ConnectionTable } from "@/components/connections/ConnectionTable";
import { ConnectionDialog } from "@/components/connections/ConnectionDialog";
import { ConnectionFilters, type FilterParams } from "@/components/connections/ConnectionFilters";
import { ConnectionPagination } from "@/components/connections/ConnectionPagination";
import { PlusCircle, AlertTriangle, RefreshCw } from "lucide-react";
import type { WeixinConnection, WeixinConnectionFormData, ConnectionsResponse } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ConnectionsPage() {
  const [connectionsData, setConnectionsData] = useState<ConnectionsResponse>({
    connections: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    }
  });
  const [filters, setFilters] = useState<FilterParams>({
    search: '',
    hasN8nWebhook: 'all',
    page: 1,
    limit: 10,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<WeixinConnection | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchConnections = useCallback(async (currentFilters: FilterParams = filters) => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('page', currentFilters.page.toString());
      searchParams.set('limit', currentFilters.limit.toString());
      
      if (currentFilters.search) {
        searchParams.set('search', currentFilters.search);
      }
      
      if (currentFilters.hasN8nWebhook !== 'all') {
        searchParams.set('hasN8nWebhook', currentFilters.hasN8nWebhook);
      }

      const response = await fetch(`/api/connections?${searchParams.toString()}`);
      if (!response.ok) {
        let errorMsg = `服务器错误 (HTTP ${response.status})。请检查服务器日志获取更多信息。`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMsg = errorData.message;
          }
        } catch (jsonError) {
          console.error("解析错误响应JSON失败:", jsonError);
        }
        toast({
          title: "加载错误",
          description: errorMsg,
          variant: "destructive",
        });
        setConnectionsData({
          connections: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        });
      } else {
        const data: ConnectionsResponse = await response.json();
        setConnectionsData(data);
      }
    } catch (error: any) {
      console.error("获取连接数据失败 (catch):", error);
      toast({
        title: "加载错误",
        description: error.message || "无法从服务器加载连接数据。请检查网络或服务器日志。",
        variant: "destructive",
      });
      setConnectionsData({
        connections: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]); 

  useEffect(() => {
    fetchConnections(filters);
  }, [filters, fetchConnections]);

  const handleFiltersChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleAddConnection = () => {
    setEditingConnection(null);
    setIsDialogOpen(true);
  };

  const handleEditConnection = (connection: WeixinConnection) => {
    setEditingConnection(connection);
    setIsDialogOpen(true);
  };

  const handleDeleteConnection = (connectionId: string) => {
    setConnectionToDelete(connectionId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (connectionToDelete) {
      setIsLoading(true); 
      try {
        const response = await fetch(`/api/connections/${connectionToDelete}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: '删除失败，请稍后再试。' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        await fetchConnections(); 
        toast({
          title: "连接已删除",
          description: "企业微信应用连接已成功删除。",
          variant: "default",
        });
      } catch (error: any) {
        console.error("删除连接失败:", error);
        toast({
          title: "删除失败",
          description: error.message || "删除连接时发生错误。",
          variant: "destructive",
        });
      } finally {
        setConnectionToDelete(null);
        setIsDeleteDialogOpen(false);
        setIsLoading(false); 
      }
    }
  };

  const handleSubmitConnection = async (data: WeixinConnectionFormData) => {
    const isEditing = !!data.id;
    const url = isEditing ? `/api/connections/${data.id}` : '/api/connections';
    const method = isEditing ? 'PUT' : 'POST';

    const payload = {
      ...data,
      n8nWebhookUrl: data.n8nWebhookUrl || null, 
    };
    
    setIsLoading(true); 
    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '操作失败，请稍后再试。'}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      await fetchConnections(); 

      toast({
        title: isEditing ? "连接已更新" : "连接已添加",
        description: `企业微信应用连接已成功${isEditing ? '更新' : '添加'}。`,
      });
      setIsDialogOpen(false);
      setEditingConnection(null);
    } catch (error: any) {
      console.error("保存连接失败:", error);
      toast({
        title: "保存失败",
        description: error.message || "保存连接时发生错误。",
        variant: "destructive",
      });
    } finally {
        setIsLoading(false); 
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">管理连接</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => fetchConnections()} variant="outline" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button onClick={handleAddConnection} disabled={isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" />
            添加新连接
          </Button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <ConnectionFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        totalResults={connectionsData.pagination.total}
      />

      {isLoading && connectionsData.connections.length === 0 ? ( 
         <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <RefreshCw className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">正在加载连接数据...</p>
        </div>
      ) : (
        <>
          <ConnectionTable
            connections={connectionsData.connections}
            onEdit={handleEditConnection}
            onDelete={handleDeleteConnection}
          />
          
          {/* 分页 */}
          <ConnectionPagination
            pagination={connectionsData.pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <ConnectionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        connection={editingConnection}
        onSubmit={handleSubmitConnection}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
              确认删除连接
            </AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。这将永久删除企业微信应用连接及其所有相关的事件日志。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
