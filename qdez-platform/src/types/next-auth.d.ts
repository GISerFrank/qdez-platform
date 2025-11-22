import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    displayName?: string | null;
    currentSchool?: string | null;
    major?: string | null;
    country?: string | null;
    city?: string | null;
    qdezClass?: string | null;
    qdezEnrollmentYear?: number | null;
    points: number;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      name: string;
      displayName?: string;
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
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    email: string;
    name: string;
    displayName?: string | null;
    currentSchool?: string | null;
    major?: string | null;
    country?: string | null;
    city?: string | null;
    qdezClass?: string | null;
    qdezEnrollmentYear?: number | null;
    points: number;
    role: string;
  }
}