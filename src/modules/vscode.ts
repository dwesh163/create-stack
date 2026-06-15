import { join } from "node:path";
import type { Module } from "../types.ts";
import { copyTemplateFile } from "../utils/fs.ts";
import { logger } from "../utils/logger.ts";

/** Add VS Code settings wiring Biome as formatter + fix-on-save. */
export const vscodeModule: Module = {
  id: "vscode",
  label: "VS Code settings",
  hint: "Biome format-on-save",
  recommended: true,
  async apply(ctx) {
    logger.step("Adding VS Code settings…");
    await copyTemplateFile("next/vscode/settings.json", join(ctx.dir, ".vscode", "settings.json"));
    logger.success("VS Code settings added");
  },
};
