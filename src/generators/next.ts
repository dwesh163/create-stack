import { join } from "node:path";
import { nextModules } from "../modules/index.ts";
import type { AppType, ProjectContext } from "../types.ts";
import { run } from "../utils/exec.ts";
import { copyTemplateFile, editJson } from "../utils/fs.ts";
import { logger } from "../utils/logger.ts";

/**
 * Generate the base Next.js project with create-next-app, then swap ESLint for
 * Biome (matching the reference starterkit conventions: src dir, app router,
 * Tailwind, `@/*` alias).
 */
async function generate(ctx: ProjectContext): Promise<void> {
  logger.step("Running create-next-app…");
  await run(
    "bunx",
    [
      "create-next-app@latest",
      ctx.dir,
      "--ts",
      "--app",
      "--src-dir",
      "--tailwind",
      "--no-eslint",
      "--turbopack",
      "--import-alias",
      "@/*",
      "--use-bun",
      "--yes",
    ],
    { cwd: process.cwd() },
  );

  await setupBiome(ctx);
}

/** Replace the default linter with Biome and wire up scripts. */
async function setupBiome(ctx: ProjectContext): Promise<void> {
  logger.step("Configuring Biome…");
  await copyTemplateFile("next/biome.json", join(ctx.dir, "biome.json"));

  await editJson<{ scripts?: Record<string, string>; devDependencies?: Record<string, string> }>(
    join(ctx.dir, "package.json"),
    (pkg) => {
      pkg.scripts ??= {};
      pkg.scripts.lint = "biome check";
      pkg.scripts.format = "biome format --write";
      pkg.devDependencies ??= {};
      pkg.devDependencies["@biomejs/biome"] = "2.4.6";
    },
  );

  // Install the freshly-added devDependency.
  await run("bun", ["install"], { cwd: ctx.dir });
  logger.success("Biome configured");
}

export const nextApp: AppType = {
  id: "next",
  label: "Next.js",
  hint: "create-next-app + Biome + src/",
  generate,
  modules: nextModules,
};
