import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      name: string;
      email: string;
      image?: string;
      userId: string;
      oid: string;
      tid: string;
      groups: string[];
    } & DefaultSession["user"];
    expires: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    access_token: string;
    expires_at: number;
    oid: string;
    tid: string;
    name: string;
    email: string;
    uniqueId: string;
    groups: string[];
    error?: string;
  }
}
