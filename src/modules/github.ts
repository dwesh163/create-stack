import { join } from "node:path";
import type { Module } from "../types.ts";
import { copyTemplateDir } from "../utils/fs.ts";
import { logger } from "../utils/logger.ts";

/**
 * Add GitHub Actions: Biome lint + Docker build/push to GHCR on PRs, and a
 * release workflow triggered by a version bump in package.json.
 */
export const githubModule: Module = {
  id: "github",
  label: "GitHub Actions",
  hint: "lint + build/push to ghcr.io",
  recommended: true,
  async apply(ctx) {
    logger.step("Adding GitHub Actions workflows…");
    await copyTemplateDir("next/github/workflows", join(ctx.dir, ".github", "workflows"));
    logger.success("GitHub Actions added (.github/workflows)");
  },
};
