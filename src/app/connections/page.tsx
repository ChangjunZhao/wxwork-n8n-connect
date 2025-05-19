
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ConnectionTable } from "@/components/connections/ConnectionTable";
import { ConnectionDialog } from "@/components/connections/ConnectionDialog";
import { PlusCircle, AlertTriangle, RefreshCw } from "lucide-react";
import type { WeixinConnection, WeixinConnectionFormData } from "@/lib/types";
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
  const [connections, setConnections] = useState<WeixinConnection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<WeixinConnection | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchConnections = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/connections');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: WeixinConnection[] = await response.json();
      setConnections(data);
    } catch (error) {
      console.error("获取连接数据失败:", error);
      toast({
        title: "加载错误",
        description: "无法从服务器加载连接数据。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

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
      try {
        const response = await fetch(`/api/connections/${connectionToDelete}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: '删除失败，请稍后再试。' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        setConnections(prev => prev.filter(conn => conn.id !== connectionToDelete));
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
      }
    }
  };

  const handleSubmitConnection = async (data: WeixinConnectionFormData) => {
    const isEditing = !!data.id;
    const url = isEditing ? `/api/connections/${data.id}` : '/api/connections';
    const method = isEditing ? 'PUT' : 'POST';

    // Ensure n8nWebhookUrl is either a valid URL or an empty string (which Prisma will convert to null if field is optional String?)
    // Or handle it in the API to convert empty string to null. For now, we pass it as is.
    const payload = {
      ...data,
      n8nWebhookUrl: data.n8nWebhookUrl || null, // Send null if empty, Prisma handles this for optional fields
    };
    
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

      // const savedConnection: WeixinConnection = await response.json();
      await fetchConnections(); // Re-fetch all connections to update the list

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
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">管理连接</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchConnections} variant="outline" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading && connections.length > 0 ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button onClick={handleAddConnection}>
            <PlusCircle className="mr-2 h-4 w-4" />
            添加新连接
          </Button>
        </div>
      </div>

      {isLoading && connections.length === 0 ? (
         <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <RefreshCw className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">正在加载连接数据...</p>
        </div>
      ) : (
        <ConnectionTable
          connections={connections}
          onEdit={handleEditConnection}
          onDelete={handleDeleteConnection}
        />
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
            <AlertDialogTitle>
              <div className="flex items-center">
                <AlertTriangle className="mr-2 h-6 w-6 text-destructive" />
                您确定要删除此连接吗？
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。这将永久从数据库中删除该连接。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConnectionToDelete(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
