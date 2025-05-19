"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConnectionForm } from "./ConnectionForm";
import type { WeixinConnection } from "@/lib/types";

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection?: WeixinConnection | null;
  onSubmit: (data: Omit<WeixinConnection, 'id'> & { id?: string }) => void;
}

export function ConnectionDialog({ open, onOpenChange, connection, onSubmit }: ConnectionDialogProps) {
  const handleSubmit = (formData: Omit<WeixinConnection, 'id'>) => {
    if (connection?.id) {
      onSubmit({ ...formData, id: connection.id });
    } else {
      onSubmit(formData);
    }
    onOpenChange(false); // Close dialog on submit
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{connection ? "编辑连接" : "添加新连接"}</DialogTitle>
          <DialogDescription>
            {connection ? "更新您的企业微信应用详情。" : "输入新的企业微信应用连接详情。"}
          </DialogDescription>
        </DialogHeader>
        <ConnectionForm
          initialData={connection}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
