/**
 * Non-interactive end-to-end driver: scaffolds a Next.js app with all modules
 * into a temp dir, bypassing the clack prompts. Used for manual verification.
 *
 *   bun run scripts/e2e.ts /tmp/e2e-next
 */
import { rm } from "node:fs/promises";
import { nextApp } from "../src/generators/next.ts";
import type { ProjectContext } from "../src/types.ts";

const dir = process.argv[2] ?? "/tmp/e2e-next";
await rm(dir, { recursive: true, force: true });

const ctx: ProjectContext = { dir, name: dir.split("/").pop() ?? "app", packageManager: "bun" };

await nextApp.generate(ctx);

for (const module of nextApp.modules) {
  console.log(`\n=== applying module: ${module.id} ===`);
  await module.apply(ctx);
}

console.log("\n✓ e2e generation complete:", dir);
