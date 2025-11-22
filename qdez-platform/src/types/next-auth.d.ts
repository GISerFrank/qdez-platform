/**
 * NextAuth.js 类型扩展
 * 
 * 扩展 NextAuth 的默认类型，添加自定义用户字段
 */

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Session 用户信息扩展
   */
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      name: string;
      displayName?: string;
      avatar?: string;
      currentSchool?: string;
      major?: string;
      country?: string;
      city?: string;
      qdezClass?: string;
      qdezEnrollmentYear?: number;
      points: number;
      role: string;
    } & DefaultSession["user"];
  }

  /**
   * User 类型扩展
   */
  interface User {
    username: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * JWT Token 类型扩展
   */
  interface JWT {
    id: string;
    username: string;
    role: string;
  }
}
