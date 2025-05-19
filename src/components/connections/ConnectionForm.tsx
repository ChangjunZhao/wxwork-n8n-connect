"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { WeixinConnection } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "应用名称至少需要 2 个字符。",
  }),
  corpId: z.string().min(5, {
    message: "企业ID (CorpID) 必须有效。",
  }),
  agentId: z.string().min(1, {
    message: "应用ID (AgentID) 必须有效。",
  }),
  token: z.string().min(3, {
    message: "令牌 (Token) 至少需要 3 个字符。",
  }),
  encodingAESKey: z.string().length(43, {
    message: "消息加解密密钥 (EncodingAESKey) 必须是 43 个字符长。",
  }),
  n8nWebhookUrl: z.string().url({ message: "请输入有效的 n8n Webhook URL。" }).optional().or(z.literal('')),
});

type ConnectionFormValues = z.infer<typeof formSchema>;

interface ConnectionFormProps {
  initialData?: WeixinConnection | null;
  onSubmit: (data: ConnectionFormValues) => void;
  onCancel: () => void;
}

export function ConnectionForm({ initialData, onSubmit, onCancel }: ConnectionFormProps) {
  const form = useForm<ConnectionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      corpId: "",
      agentId: "",
      token: "",
      encodingAESKey: "",
      n8nWebhookUrl: "",
    },
  });

  const handleSubmit = (values: ConnectionFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>应用名称</FormLabel>
              <FormControl>
                <Input placeholder="例如：人事门户机器人" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="corpId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>企业ID (CorpID)</FormLabel>
              <FormControl>
                <Input placeholder="您的企业微信 CorpID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="agentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>应用ID (AgentID)</FormLabel>
              <FormControl>
                <Input placeholder="您的应用 AgentID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>令牌 (Token)</FormLabel>
              <FormControl>
                <Input type="password" placeholder="您配置的 Token" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="encodingAESKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>消息加解密密钥 (EncodingAESKey)</FormLabel>
              <FormControl>
                <Input type="password" placeholder="您配置的 EncodingAESKey" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="n8nWebhookUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>n8n Webhook 地址 (可选)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="例如: http://your-n8n-instance/webhook/..." {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit">
            {initialData?.id ? "保存更改" : "创建连接"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
