"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log("🔐 AuthGuard检查：", { status, session: !!session });
    
    if (status === "loading") {
      // 仍在加载，等待
      return;
    }
    
    if (status === "unauthenticated") {
      console.log("❌ 未认证，重定向到登录页面");
      router.push("/auth/signin");
      return;
    }
  }, [status, session, router]);

  // 加载中显示加载器
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">正在验证身份...</p>
        </div>
      </div>
    );
  }

  // 未认证用户显示空白页面（会被重定向）
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">正在重定向到登录页面...</p>
        </div>
      </div>
    );
  }

  // 已认证用户显示内容
  return <>{children}</>;
} 