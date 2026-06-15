import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Module, ProjectContext } from "../types.ts";
import { appendFileEnsured, copyTemplateFile, templatePath } from "../utils/fs.ts";
import { LayoutEditor } from "../utils/layout.ts";
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

/** Wrap the root layout's body in <SessionProvider> and make it async. */
async function wireLayout(ctx: ProjectContext): Promise<void> {
  const layoutPath = join(ctx.dir, "src", "app", "layout.tsx");
  const editor = await LayoutEditor.load(layoutPath);
  editor
    .addImports(['import { SessionProvider } from "@/providers/session";', 'import { auth } from "@/services/auth";'])
    .ensureAsync()
    .addPreReturn("const session = await auth();")
    .wrapBody("<SessionProvider session={session}>", "</SessionProvider>");
  await editor.save(layoutPath);
}

/** Create a .env with a generated AUTH_SECRET and Entra ID placeholders. */
async function writeEnv(ctx: ProjectContext): Promise<void> {
  const secret = randomBytes(32).toString("base64");
  const block = [
    "# Auth.js",
    `AUTH_SECRET=${secret}`,
    "",
    "# Microsoft Entra ID (Azure AD) application credentials",
    "ENTRA_ID=",
    "ENTRA_SECRET=",
    "ENTRA_ISSUER=https://login.microsoftonline.com/<tenant-id>/v2.0",
    "",
  ].join("\n");
  await appendFileEnsured(join(ctx.dir, ".env"), `${block}`);
}

/**
 * Auth.js (next-auth v5) scaffolding, structured like the reference starterkit:
 * a Microsoft Entra ID provider, JWT sessions, a `proxy.ts` guarding
 * PROTECTED_ROUTES, typed session/JWT augmentation, and the root layout wired
 * with <SessionProvider>. AUTH_SECRET is generated into `.env`.
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
    await writeEnv(ctx);

    await addDeps(ctx, ["next-auth@beta"]);
    await wireLayout(ctx);
    logger.success("Authentication added & wired into the root layout");
  },
};
