/**
 * Next.js 中间件 - 路由保护
 * 
 * 功能：
 * 1. 保护需要登录的路由（如 /campus, /profile 等）
 * 2. 已登录用户访问登录页时重定向到主平台
 * 3. 允许公开路由无需认证访问
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // 已登录用户访问登录页，重定向到主平台
    if (req.nextUrl.pathname === "/login" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // 公开路由列表
        const publicPaths = [
          "/",
          "/login",
          "/register",
          "/invite",
          "/api/auth",
          "/api/invite-codes/validate",
          "/api/auth/check-availability",
          "/api/auth/register",
        ];
        
        // 检查是否是公开路由
        const isPublicPath = publicPaths.some(
          path => pathname === path || pathname.startsWith(path + "/")
        );
        
        if (isPublicPath) {
          return true;
        }
        
        // 其他路由需要登录
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico
     * - 公共资源 (png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
