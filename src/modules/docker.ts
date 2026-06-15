import { join } from "node:path";
import type { Module } from "../types.ts";
import { copyTemplateFile } from "../utils/fs.ts";
import { logger } from "../utils/logger.ts";

/**
 * Add a multi-stage, bun-based Dockerfile that serves the standalone build.
 * Depends on the standalone module since the runner stage copies
 * `.next/standalone`.
 */
export const dockerModule: Module = {
  id: "docker",
  label: "Dockerfile",
  hint: "multi-stage bun image (needs standalone)",
  recommended: true,
  requires: ["standalone"],
  async apply(ctx) {
    logger.step("Adding Dockerfile…");
    await copyTemplateFile("next/docker/Dockerfile", join(ctx.dir, "Dockerfile"));
    await copyTemplateFile("next/docker/.dockerignore", join(ctx.dir, ".dockerignore"));
    logger.success("Dockerfile added");
  },
};
