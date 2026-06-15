import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Module } from "../types.ts";
import { run } from "../utils/exec.ts";
import { appendFileEnsured, copyTemplateFile, templatePath } from "../utils/fs.ts";
import { logger } from "../utils/logger.ts";
import { addDeps, addDevDeps, execRunner } from "../utils/pm.ts";

/**
 * Prisma 7 ORM setup: schema (driver-adapter style, no inline url) +
 * prisma.config.ts holding the datasource url + a hot-reload-safe client
 * singleton using the node-postgres adapter. The client is emitted to
 * `src/generated/prisma` and re-generated at the end.
 */
export const prismaModule: Module = {
  id: "prisma",
  label: "Prisma ORM",
  hint: "schema + pg adapter client",
  async apply(ctx) {
    logger.step("Adding Prisma…");
    await copyTemplateFile("next/prisma/schema.prisma", join(ctx.dir, "prisma", "schema.prisma"));
    await copyTemplateFile("next/prisma/prisma.config.ts", join(ctx.dir, "prisma.config.ts"));
    await copyTemplateFile("next/prisma/lib/prisma.ts", join(ctx.dir, "src", "lib", "prisma.ts"));

    const envBlock = await readFile(templatePath("next/prisma/env.example"), "utf8");
    await appendFileEnsured(join(ctx.dir, ".env.example"), `\n${envBlock}`);
    // Keep the generated client out of version control.
    await appendFileEnsured(join(ctx.dir, ".gitignore"), "\n# prisma\n/src/generated\n");

    await addDevDeps(ctx, ["prisma", "dotenv"]);
    await addDeps(ctx, ["@prisma/client", "@prisma/adapter-pg", "pg"]);

    await run(execRunner(ctx.packageManager), ["prisma", "generate"], { cwd: ctx.dir });
    logger.success("Prisma added");
    logger.dim("  → set DATABASE_URL in .env, then run `bunx prisma migrate dev`");
  },
};
