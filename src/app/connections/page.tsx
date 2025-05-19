"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ConnectionTable } from "@/components/connections/ConnectionTable";
import { ConnectionDialog } from "@/components/connections/ConnectionDialog";
import { PlusCircle, AlertTriangle } from "lucide-react";
import type { WeixinConnection } from "@/lib/types";
import { initialConnections } from "@/lib/mockData";
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
  const { toast } = useToast();

  // Load connections from localStorage or use initial mock data
  useEffect(() => {
    const storedConnections = localStorage.getItem('weixinConnections');
    if (storedConnections) {
      setConnections(JSON.parse(storedConnections));
    } else {
      setConnections(initialConnections);
    }
  }, []);

  // Save connections to localStorage whenever they change
  useEffect(() => {
    if (connections.length > 0 || localStorage.getItem('weixinConnections')) { // only save if there's data or it was loaded
        localStorage.setItem('weixinConnections', JSON.stringify(connections));
    }
  }, [connections]);


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

  const confirmDelete = () => {
    if (connectionToDelete) {
      setConnections(prev => prev.filter(conn => conn.id !== connectionToDelete));
      toast({
        title: "Connection Deleted",
        description: "The Weixin App connection has been successfully deleted.",
        variant: "default",
      });
      setConnectionToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleSubmitConnection = (data: Omit<WeixinConnection, 'id'> & { id?: string }) => {
    if (data.id) { // Editing existing connection
      setConnections(prev => prev.map(conn => conn.id === data.id ? { ...conn, ...data } : conn));
      toast({
        title: "Connection Updated",
        description: "The Weixin App connection has been successfully updated.",
      });
    } else { // Adding new connection
      const newConnection = { ...data, id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` };
      setConnections(prev => [...prev, newConnection]);
      toast({
        title: "Connection Added",
        description: "The new Weixin App connection has been successfully added.",
      });
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manage Connections</h2>
        <Button onClick={handleAddConnection}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Connection
        </Button>
      </div>

      <ConnectionTable
        connections={connections}
        onEdit={handleEditConnection}
        onDelete={handleDeleteConnection}
      />

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
                Are you sure you want to delete this connection?
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              connection and remove its configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConnectionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
