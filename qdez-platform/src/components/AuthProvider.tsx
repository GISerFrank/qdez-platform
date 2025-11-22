/**
 * NextAuth Session Provider
 * 
 * 包装整个应用，提供 session 上下文
 * 使得所有组件都可以使用 useSession() hook
 */

"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
