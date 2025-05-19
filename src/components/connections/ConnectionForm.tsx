"use client";

import type * as z from "zod";
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
    message: "App name must be at least 2 characters.",
  }),
  corpId: z.string().min(5, { // Typically wwCorpId... or similar
    message: "CorpID must be valid.",
  }),
  agentId: z.string().min(1, {
    message: "AgentID must be valid.",
  }),
  token: z.string().min(3, { // Weixin tokens are usually 3-32 chars
    message: "Token must be at least 3 characters.",
  }),
  encodingAESKey: z.string().length(43, { // EncodingAESKey is always 43 characters
    message: "EncodingAESKey must be 43 characters long.",
  }),
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
              <FormLabel>App Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., HR Portal Bot" {...field} />
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
              <FormLabel>CorpID (企业ID)</FormLabel>
              <FormControl>
                <Input placeholder="Your Weixin Work CorpID" {...field} />
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
              <FormLabel>AgentID (应用ID)</FormLabel>
              <FormControl>
                <Input placeholder="Your App's AgentID" {...field} />
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
              <FormLabel>Token</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Your configured Token" {...field} />
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
              <FormLabel>EncodingAESKey</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Your configured EncodingAESKey" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Save Changes" : "Create Connection"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
