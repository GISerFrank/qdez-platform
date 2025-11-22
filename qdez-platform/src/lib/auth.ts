/**
 * NextAuth.js 认证配置 - 修复类型错误版本
 *
 * 功能：
 * - Credentials 登录（用户名/邮箱 + 密码）
 * - Database Session 策略
 * - 完整的用户信息存储在 session 中
 */

import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  // ✅ 修复：使用类型断言
  adapter: PrismaAdapter(prisma) as Adapter,

  // 使用数据库 Session 策略
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30天
    updateAge: 24 * 60 * 60,   // 24小时更新一次
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "用户名或邮箱", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("请输入用户名和密码");
        }

        // 查找用户（支持用户名或邮箱登录）
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: credentials.identifier },
              { email: credentials.identifier },
            ],
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error("用户名或密码错误");
        }

        // 验证密码
        const isValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
        );

        if (!isValid) {
          throw new Error("用户名或密码错误");
        }

        // 更新最后登录时间
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // 返回用户信息（会被存入 session）
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
        };
      },
    }),
  ],

  callbacks: {
    // 自定义 session 内容
    async session({ session, user }) {
      // 从数据库获取完整用户信息
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          displayName: true,
          // ✅ 修复：只选择存在的字段，如果你的 Schema 中没有 avatar，就注释掉
          // avatar: true,
          currentSchool: true,
          major: true,
          country: true,
          city: true,
          qdezClass: true,
          qdezEnrollmentYear: true,
          points: true,
          role: true,
        },
      });

      if (fullUser) {
        session.user = {
          ...session.user,
          // ✅ 修复：处理 nullable 字段
          id: fullUser.id,
          username: fullUser.username,
          email: fullUser.email,
          name: fullUser.name ?? fullUser.username,
          displayName: fullUser.displayName ?? undefined,
          // avatar: fullUser.avatar ?? undefined,  // 如果有 avatar 字段，取消注释
          currentSchool: fullUser.currentSchool ?? undefined,
          major: fullUser.major ?? undefined,
          country: fullUser.country ?? undefined,
          city: fullUser.city ?? undefined,
          qdezClass: fullUser.qdezClass ?? undefined,
          qdezEnrollmentYear: fullUser.qdezEnrollmentYear ?? undefined,
          points: fullUser.points,
          role: fullUser.role,
        };
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  // 开发环境允许 HTTP
  ...(process.env.NODE_ENV === "development" && {
    cookies: {
      sessionToken: {
        name: "next-auth.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: false,
        },
      },
    },
  }),
};