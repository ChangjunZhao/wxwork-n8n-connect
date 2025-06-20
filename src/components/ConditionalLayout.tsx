"use client";

import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { AuthGuard } from '@/components/AuthGuard';
import type { ReactNode } from 'react';

interface ConditionalLayoutProps {
  children: ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // 认证相关页面不显示AppShell，也不需要认证检查
  const isAuthPage = pathname?.startsWith('/auth/');
  
  console.log("🎨 布局渲染：", { pathname, isAuthPage });
  
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  // 非认证页面需要认证检查并显示AppShell
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
} 