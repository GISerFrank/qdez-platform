/**
 * NextAuth.js 认证配置 - JWT 策略版本
 *
 * 功能：
 * - Credentials 登录（用户名/邮箱 + 密码）
 * - JWT Session 策略
 * - 完整的用户信息存储在 session 中
 */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  // ✅ 使用 JWT Session 策略
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30天
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

        // ✅ 返回完整用户信息（会被存入 JWT token）
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.username, // 使用 username 作为后备
          username: user.username,
          displayName: user.displayName,
          currentSchool: user.currentSchool,
          major: user.major,
          country: user.country,
          city: user.city,
          qdezClass: user.qdezClass,
          qdezEnrollmentYear: user.qdezEnrollmentYear,
          points: user.points,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // ✅ JWT 回调：首次登录时将用户信息存入 token
    async jwt({ token, user }) {
      if (user) {
        // 首次登录，user 对象存在
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.name = user.name;
        token.displayName = user.displayName;
        token.currentSchool = user.currentSchool;
        token.major = user.major;
        token.country = user.country;
        token.city = user.city;
        token.qdezClass = user.qdezClass;
        token.qdezEnrollmentYear = user.qdezEnrollmentYear;
        token.points = user.points;
        token.role = user.role;
      }
      return token;
    },

    // ✅ Session 回调：从 token 提取信息到 session
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          username: token.username as string,
          email: token.email as string,
          name: token.name as string,
          displayName: token.displayName as string | undefined,
          currentSchool: token.currentSchool as string | undefined,
          major: token.major as string | undefined,
          country: token.country as string | undefined,
          city: token.city as string | undefined,
          qdezClass: token.qdezClass as string | undefined,
          qdezEnrollmentYear: token.qdezEnrollmentYear as number | undefined,
          points: token.points as number,
          role: token.role as string,
        };
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // 登录后重定向到首页而不是 /campus
      return baseUrl;  // 即 "/"
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