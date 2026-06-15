#!/usr/bin/env bun
import { resolve } from "node:path";
import { cancel, confirm, intro, isCancel, multiselect, note, outro, select, text } from "@clack/prompts";
import pc from "picocolors";
import { appTypes, getAppType } from "./registry/index.ts";
import type { AppType, Module, ProjectContext } from "./types.ts";
import { logger } from "./utils/logger.ts";

/** Abort cleanly on Ctrl-C / cancelled prompt. */
function ensure<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel("Cancelled.");
    process.exit(0);
  }
  return value as T;
}

/** Expand a selection to include modules required by `requires`. */
function withRequired(selected: Set<string>, modules: Module[]): Set<string> {
  const byId = new Map(modules.map((m) => [m.id, m]));
  const result = new Set(selected);
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of [...result]) {
      for (const dep of byId.get(id)?.requires ?? []) {
        if (!result.has(dep)) {
          result.add(dep);
          changed = true;
        }
      }
    }
  }
  return result;
}

async function pickModules(appType: AppType): Promise<Set<string>> {
  if (appType.modules.length === 0) return new Set();

  const chosen = ensure(
    await multiselect({
      message: "Which modules do you want? (space to toggle, enter to confirm)",
      required: false,
      options: appType.modules.map((m) => ({
        value: m.id,
        label: m.label,
        hint: m.hint,
      })),
      initialValues: appType.modules.filter((m) => m.recommended).map((m) => m.id),
    }),
  ) as string[];

  return withRequired(new Set(chosen), appType.modules);
}

async function main() {
  intro(pc.bgCyan(pc.black(" create-stack ")));

  const typeId = ensure(
    await select({
      message: "What do you want to create?",
      options: appTypes.map((t) => ({ value: t.id, label: t.label, hint: t.hint })),
    }),
  );
  const appType = getAppType(typeId);
  if (!appType) {
    cancel(`Unknown app type: ${typeId}`);
    process.exit(1);
  }

  const name = ensure(
    await text({
      message: "Project name?",
      placeholder: "my-app",
      defaultValue: "my-app",
      validate: (v) => {
        const value = v || "my-app";
        if (!/^[a-z0-9._-]+$/i.test(value)) return "Use letters, numbers, '.', '-' or '_' only.";
        return undefined;
      },
    }),
  );

  const selected = await pickModules(appType);

  const dir = resolve(process.cwd(), name);
  const moduleList = appType.modules.filter((m) => selected.has(m.id));
  note(
    [
      `${pc.dim("Type    ")} ${appType.label}`,
      `${pc.dim("Location")} ${dir}`,
      `${pc.dim("Modules ")} ${moduleList.length ? moduleList.map((m) => m.label).join(", ") : pc.dim("none")}`,
    ].join("\n"),
    "Summary",
  );

  const go = ensure(await confirm({ message: "Create the project?" }));
  if (!go) {
    cancel("Aborted.");
    process.exit(0);
  }

  const ctx: ProjectContext = { dir, name, packageManager: "bun" };

  await appType.generate(ctx);

  for (const module of moduleList) {
    try {
      await module.apply(ctx);
    } catch (error) {
      logger.error(`Module "${module.label}" failed: ${(error as Error).message}`);
      logger.warn("Continuing with the remaining modules…");
    }
  }

  outro([pc.green("Done!"), "", "Next steps:", pc.cyan(`  cd ${name}`), pc.cyan("  bun dev")].join("\n"));
}

main().catch((error) => {
  logger.error((error as Error).message);
  process.exit(1);
});
