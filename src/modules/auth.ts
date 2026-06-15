import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Module, ProjectContext } from "../types.ts";
import { appendFileEnsured, copyTemplateFile, templatePath } from "../utils/fs.ts";
import { logger } from "../utils/logger.ts";
import { addDeps } from "../utils/pm.ts";

const FILES: Array<[from: string, to: string]> = [
  ["next/auth/services/auth.ts", "src/services/auth.ts"],
  ["next/auth/proxy.ts", "src/proxy.ts"],
  ["next/auth/providers/session.tsx", "src/providers/session.tsx"],
  ["next/auth/types/next-auth.d.ts", "src/types/next-auth.d.ts"],
  ["next/auth/constants/routes.ts", "src/constants/routes.ts"],
  ["next/auth/app/api/auth/route.ts", "src/app/api/auth/route.ts"],
  ["next/auth/app/api/auth/[...nextauth]/route.ts", "src/app/api/auth/[...nextauth]/route.ts"],
];

/**
 * Auth.js (next-auth v5) scaffolding, structured like the reference starterkit:
 * a Microsoft Entra ID provider, JWT sessions, a `proxy.ts` guarding
 * PROTECTED_ROUTES, and typed session/JWT augmentation.
 */
export const authModule: Module = {
  id: "auth",
  label: "Authentication",
  hint: "next-auth v5 (Microsoft Entra ID)",
  async apply(ctx: ProjectContext) {
    logger.step("Adding authentication (next-auth)…");
    for (const [from, to] of FILES) {
      await copyTemplateFile(from, join(ctx.dir, to));
    }

    const envBlock = await readFile(templatePath("next/auth/env.example"), "utf8");
    await appendFileEnsured(join(ctx.dir, ".env.example"), `\n${envBlock}`);

    await addDeps(ctx, ["next-auth@beta"]);
    logger.success("Authentication added");
    logger.dim("  → wrap your app in <SessionProvider> (src/providers/session.tsx) and set ENTRA_* in .env");
  },
};
