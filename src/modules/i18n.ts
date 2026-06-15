import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Module, ProjectContext } from "../types.ts";
import { copyTemplateFile } from "../utils/fs.ts";
import { LayoutEditor } from "../utils/layout.ts";
import { logger } from "../utils/logger.ts";
import { addDeps } from "../utils/pm.ts";

const FILES: Array<[from: string, to: string]> = [
  ["next/i18n/i18n.ts", "src/i18n.ts"],
  ["next/i18n/services/locale.ts", "src/services/locale.ts"],
  ["next/i18n/constants/i18n.ts", "src/constants/i18n.ts"],
  ["next/i18n/messages/en.json", "src/messages/en.json"],
  ["next/i18n/messages/fr.json", "src/messages/fr.json"],
];

/** Wrap next.config with the next-intl plugin, pointing at src/i18n.ts. */
async function wrapNextConfig(ctx: ProjectContext): Promise<void> {
  const configPath = join(ctx.dir, "next.config.ts");
  let source = await readFile(configPath, "utf8");

  if (source.includes("next-intl/plugin")) return;

  source = source.replace(
    /import type \{ NextConfig \} from "next";/,
    'import type { NextConfig } from "next";\nimport createNextIntlPlugin from "next-intl/plugin";',
  );

  source = source.replace(
    /export default nextConfig;/,
    'const withNextIntl = createNextIntlPlugin("./src/i18n.ts");\n\nexport default withNextIntl(nextConfig);',
  );

  await writeFile(configPath, source, "utf8");
}

/** Wrap the root layout in <NextIntlClientProvider> and use the request locale. */
async function wireLayout(ctx: ProjectContext): Promise<void> {
  const layoutPath = join(ctx.dir, "src", "app", "layout.tsx");
  const editor = await LayoutEditor.load(layoutPath);
  editor
    .addImports([
      'import { NextIntlClientProvider } from "next-intl";',
      'import { getLocale, getMessages } from "next-intl/server";',
    ])
    .ensureAsync()
    .addExportConst('export const dynamic = "force-dynamic";')
    .addPreReturn("const locale = await getLocale();")
    .addPreReturn("const messages = await getMessages();")
    .setHtmlLang("locale")
    .wrapBody("<NextIntlClientProvider messages={messages}>", "</NextIntlClientProvider>");
  await editor.save(layoutPath);
}

/**
 * Cookie/Accept-Language driven internationalization with next-intl, mirroring
 * the starterkit (en/fr, default fr). Wires the request config into both
 * next.config and the root layout so it works out of the box.
 */
export const i18nModule: Module = {
  id: "i18n",
  label: "Internationalization",
  hint: "next-intl (en/fr)",
  async apply(ctx) {
    logger.step("Adding internationalization (next-intl)…");
    for (const [from, to] of FILES) {
      await copyTemplateFile(from, join(ctx.dir, to));
    }
    await wrapNextConfig(ctx);
    await addDeps(ctx, ["next-intl"]);
    await wireLayout(ctx);
    logger.success("Internationalization added & wired into the root layout");
  },
};
