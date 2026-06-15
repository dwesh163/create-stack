import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Module } from "../types.ts";
import { logger } from "../utils/logger.ts";

/**
 * Switch the Next.js build to `output: "standalone"` so it produces a minimal,
 * self-contained server bundle — required for the Docker image.
 */
export const standaloneModule: Module = {
  id: "standalone",
  label: "Standalone output",
  hint: 'next.config → output: "standalone"',
  recommended: true,
  async apply(ctx) {
    const configPath = join(ctx.dir, "next.config.ts");
    const source = await readFile(configPath, "utf8");

    if (source.includes('output: "standalone"')) {
      logger.dim("Standalone output already configured");
      return;
    }

    const anchor = /const nextConfig: NextConfig = \{/;
    if (!anchor.test(source)) {
      logger.warn('Could not locate nextConfig object — add `output: "standalone"` manually.');
      return;
    }

    const next = source.replace(
      anchor,
      'const nextConfig: NextConfig = {\n  output: "standalone",\n  outputFileTracingRoot: __dirname,',
    );
    await writeFile(configPath, next, "utf8");
    logger.success("Standalone output enabled");
  },
};
