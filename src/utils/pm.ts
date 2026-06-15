import type { ProjectContext } from "../types.ts";
import { run } from "./exec.ts";

/** Map a package manager to its "add dependency" invocation. */
function addCommand(pm: ProjectContext["packageManager"], dev: boolean): [string, string[]] {
  switch (pm) {
    case "npm":
      return ["npm", ["install", dev ? "--save-dev" : "--save"]];
    case "pnpm":
      return ["pnpm", ["add", ...(dev ? ["-D"] : [])]];
    case "yarn":
      return ["yarn", ["add", ...(dev ? ["-D"] : [])]];
    default:
      return ["bun", ["add", ...(dev ? ["-d"] : [])]];
  }
}

/** Install runtime dependencies into the generated project. */
export async function addDeps(ctx: ProjectContext, packages: string[]): Promise<void> {
  if (packages.length === 0) return;
  const [cmd, base] = addCommand(ctx.packageManager, false);
  await run(cmd, [...base, ...packages], { cwd: ctx.dir });
}

/** Install dev dependencies into the generated project. */
export async function addDevDeps(ctx: ProjectContext, packages: string[]): Promise<void> {
  if (packages.length === 0) return;
  const [cmd, base] = addCommand(ctx.packageManager, true);
  await run(cmd, [...base, ...packages], { cwd: ctx.dir });
}

/** The binary runner for the package manager (bunx, npx, ...). */
export function execRunner(pm: ProjectContext["packageManager"]): string {
  switch (pm) {
    case "npm":
      return "npx";
    case "pnpm":
      return "pnpm";
    case "yarn":
      return "yarn";
    default:
      return "bunx";
  }
}
