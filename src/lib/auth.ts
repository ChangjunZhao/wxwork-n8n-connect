import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSession(req?: NextRequest) {
  return await getServerSession(authOptions);
}

export async function getCurrentUser(req?: NextRequest) {
  const session = await getSession(req);
  return session?.user;
}

export async function requireAuth(req?: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Error("未授权访问");
  }
  return user;
}

export async function requireAdmin(req?: NextRequest) {
  const user = await requireAuth(req);
  if (user.role !== 'admin') {
    throw new Error("需要管理员权限");
  }
  return user;
} 