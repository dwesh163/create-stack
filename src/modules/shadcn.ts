import type { Module } from "../types.ts";
import { run } from "../utils/exec.ts";
import { logger } from "../utils/logger.ts";
import { execRunner } from "../utils/pm.ts";

/**
 * Initialize shadcn/ui (writes components.json, theme tokens into globals.css,
 * installs the required deps) and pull in a first component so the setup is
 * immediately usable.
 */
export const shadcnModule: Module = {
  id: "shadcn",
  label: "shadcn/ui",
  hint: "component library + Tailwind theme",
  recommended: true,
  async apply(ctx) {
    const runner = execRunner(ctx.packageManager);
    logger.step("Initializing shadcn/ui…");
    await run(runner, ["shadcn@latest", "init", "--defaults", "--yes"], { cwd: ctx.dir });
    await run(runner, ["shadcn@latest", "add", "button", "--yes"], { cwd: ctx.dir });
    logger.success("shadcn/ui ready");
  },
};
