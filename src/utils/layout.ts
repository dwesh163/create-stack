import { readFile, writeFile } from "node:fs/promises";

/**
 * Small, idempotent transformer for the generated `src/app/layout.tsx`.
 *
 * Modules use it to actually wire themselves into the root layout (providers,
 * awaited server calls, `<html lang>`, …) instead of just printing follow-up
 * instructions. Every operation is a no-op when its result is already present,
 * so multiple modules can edit the same layout in any order. `wrapBody` wraps
 * the current body content, so the module that runs last ends up outermost.
 */
export class LayoutEditor {
  private constructor(private source: string) {}

  static async load(path: string): Promise<LayoutEditor> {
    return new LayoutEditor(await readFile(path, "utf8"));
  }

  async save(path: string): Promise<void> {
    await writeFile(path, this.source, "utf8");
  }

  /** Add import statements after `import "./globals.css";` (or at the top). */
  addImports(lines: string[]): this {
    const anchor = 'import "./globals.css";';
    for (const line of lines) {
      if (this.source.includes(line)) continue;
      this.source = this.source.includes(anchor)
        ? this.source.replace(anchor, `${anchor}\n${line}`)
        : `${line}\n${this.source}`;
    }
    return this;
  }

  /** Make the default-exported RootLayout component `async`. */
  ensureAsync(): this {
    if (!/export default async function RootLayout/.test(this.source)) {
      this.source = this.source.replace(
        /export default function RootLayout/,
        "export default async function RootLayout",
      );
    }
    return this;
  }

  /** Insert a statement just before the component's `return (`. */
  addPreReturn(statement: string): this {
    if (this.source.includes(statement)) return this;
    this.source = this.source.replace(/(\n([ \t]*))return \(/, `$1${statement}$1return (`);
    return this;
  }

  /** Add a top-level `export const …` before the default export. */
  addExportConst(line: string): this {
    if (this.source.includes(line)) return this;
    this.source = this.source.replace(/export default/, `${line}\n\nexport default`);
    return this;
  }

  /** Replace the `<html lang="…">` value with a JSX expression. */
  setHtmlLang(expr: string): this {
    this.source = this.source.replace(/lang="[^"]*"/, `lang={${expr}}`);
    return this;
  }

  /** Wrap the current `<body>` content with a provider/component. */
  wrapBody(open: string, close: string): this {
    this.source = this.source.replace(
      /(<body[^>]*>)([\s\S]*?)(<\/body>)/,
      (_match, openTag: string, inner: string, closeTag: string) =>
        `${openTag}\n        ${open}${inner.trim()}${close}\n      ${closeTag}`,
    );
    return this;
  }
}
