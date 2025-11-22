/**
 * NextAuth.js API 路由
 * 
 * 处理所有认证相关的请求：
 * - GET  /api/auth/signin - 登录页面
 * - POST /api/auth/callback/credentials - 登录处理
 * - GET  /api/auth/session - 获取当前会话
 * - POST /api/auth/signout - 登出
 * - GET  /api/auth/csrf - CSRF Token
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
