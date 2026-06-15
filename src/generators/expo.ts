import type { AppType, ProjectContext } from "../types.ts";
import { run } from "../utils/exec.ts";
import { logger } from "../utils/logger.ts";

/**
 * Generate a base Expo project. Kept intentionally minimal per spec — just the
 * official `create-expo-app` with the default template. Modules can be added
 * here later as the Expo path matures.
 */
async function generate(ctx: ProjectContext): Promise<void> {
  logger.step("Running create-expo-app…");
  await run("bunx", ["create-expo-app@latest", ctx.dir, "--yes"], { cwd: process.cwd() });
}

export const expoApp: AppType = {
  id: "expo",
  label: "Expo",
  hint: "create-expo-app (React Native)",
  generate,
  modules: [],
};
