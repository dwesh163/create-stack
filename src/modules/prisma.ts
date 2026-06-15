import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Module } from "../types.ts";
import { run } from "../utils/exec.ts";
import { appendFileEnsured, copyTemplateFile, editJson, templatePath } from "../utils/fs.ts";
import { logger } from "../utils/logger.ts";
import { addDeps, addDevDeps, execRunner } from "../utils/pm.ts";

/**
 * `bun dev` script ported from the reference starterkit: it boots a disposable
 * local Postgres container, regenerates the client, then starts Next — so a
 * fresh project is runnable end-to-end without any manual database setup.
 */
const DEV_SCRIPT =
  "docker run -d --name $npm_package_name-db --rm -p 37874:5432 " +
  "-e POSTGRES_USER=app -e POSTGRES_PASSWORD=password -e POSTGRES_DB=dev " +
  "-v $npm_package_name-db:/var/lib/postgresql/data postgres:18-alpine 2>/dev/null; " +
  "bunx prisma generate && next dev";

/**
 * Prisma 7 ORM, mirroring the reference starterkit: schema under `src/prisma`,
 * `prisma.config.ts` holding the datasource url, and a client singleton using
 * the node-postgres driver adapter. The generated client lands in
 * `generated/prisma` and is regenerated at the end.
 */
export const prismaModule: Module = {
  id: "prisma",
  label: "Prisma ORM",
  hint: "schema + pg adapter + dockerized dev DB",
  async apply(ctx) {
    logger.step("Adding Prisma…");
    await copyTemplateFile("next/prisma/schema.prisma", join(ctx.dir, "src", "prisma", "schema.prisma"));
    await copyTemplateFile("next/prisma/prisma.config.ts", join(ctx.dir, "prisma.config.ts"));
    await copyTemplateFile("next/prisma/lib/prisma.ts", join(ctx.dir, "src", "lib", "prisma.ts"));

    const envBlock = await readFile(templatePath("next/prisma/env.example"), "utf8");
    await appendFileEnsured(join(ctx.dir, ".env.example"), `\n${envBlock}`);
    await appendFileEnsured(join(ctx.dir, ".env"), `\n${envBlock}`);
    // Keep the generated client out of version control.
    await appendFileEnsured(join(ctx.dir, ".gitignore"), "\n# prisma\n/generated\n");

    // Wire `bun dev` to spin up a local Postgres + regenerate the client.
    await editJson<{ scripts?: Record<string, string> }>(join(ctx.dir, "package.json"), (pkg) => {
      pkg.scripts ??= {};
      pkg.scripts.dev = DEV_SCRIPT;
    });

    await addDevDeps(ctx, ["prisma", "dotenv", "@types/pg"]);
    await addDeps(ctx, ["@prisma/client", "@prisma/adapter-pg", "pg"]);

    await run(execRunner(ctx.packageManager), ["prisma", "generate"], { cwd: ctx.dir });
    logger.success("Prisma added (run `bun dev` to start the local DB + app)");
  },
};
