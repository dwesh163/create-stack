import type { Module } from "../types.ts";
import { authModule } from "./auth.ts";
import { dockerModule } from "./docker.ts";
import { githubModule } from "./github.ts";
import { i18nModule } from "./i18n.ts";
import { prismaModule } from "./prisma.ts";
import { shadcnModule } from "./shadcn.ts";
import { standaloneModule } from "./standalone.ts";
import { vscodeModule } from "./vscode.ts";

/**
 * Next.js modules, in execution order. Dependencies (e.g. docker → standalone)
 * are declared via `requires` and resolved by the runner; keep prerequisites
 * earlier in this list so they apply first.
 */
export const nextModules: Module[] = [
  shadcnModule,
  standaloneModule,
  dockerModule,
  githubModule,
  vscodeModule,
  authModule,
  i18nModule,
  prismaModule,
];
