import { appendFile, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Absolute path to the package root (one level above `src/`). */
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Resolve a path inside the bundled `templates/` directory. */
export function templatePath(...segments: string[]): string {
  return join(packageRoot, "templates", ...segments);
}

/** Copy a single template file to an absolute destination, creating dirs. */
export async function copyTemplateFile(templateRel: string, dest: string): Promise<void> {
  await mkdir(dirname(dest), { recursive: true });
  await cp(templatePath(templateRel), dest);
}

/** Recursively copy a template directory into an absolute destination. */
export async function copyTemplateDir(templateRel: string, dest: string): Promise<void> {
  await mkdir(dest, { recursive: true });
  await cp(templatePath(templateRel), dest, { recursive: true });
}

/** Write a string to an absolute path, creating parent directories. */
export async function writeFileEnsured(dest: string, contents: string): Promise<void> {
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, contents, "utf8");
}

/** Append text to a file, creating it (and parent dirs) if needed. */
export async function appendFileEnsured(dest: string, contents: string): Promise<void> {
  await mkdir(dirname(dest), { recursive: true });
  await appendFile(dest, contents, "utf8");
}

/** Read and parse a JSON file. */
export async function readJson<T = Record<string, unknown>>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, "utf8")) as T;
}

/** Read, transform and write back a JSON file (2-space indented). */
export async function editJson<T = Record<string, unknown>>(file: string, edit: (json: T) => void): Promise<void> {
  const json = await readJson<T>(file);
  edit(json);
  await writeFile(file, `${JSON.stringify(json, null, 2)}\n`, "utf8");
}
