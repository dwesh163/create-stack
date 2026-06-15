/**
 * Shared types for the scaffolder.
 *
 * The CLI is organized around two extensible concepts:
 *  - `AppType`   : a kind of project the CLI can create (Next.js, Expo, ...).
 *  - `Module`    : an opt-in feature added on top of a generated project.
 *
 * Adding a new framework later is just a matter of pushing a new `AppType`
 * into the registry (see `src/registry/index.ts`).
 */

export interface ProjectContext {
  /** Absolute path to the generated project root. */
  dir: string;
  /** Project name (folder / package name). */
  name: string;
  /** Package manager used to run install commands. */
  packageManager: "bun" | "npm" | "pnpm" | "yarn";
}

export interface Module {
  /** Stable identifier, used internally and for dependency wiring. */
  id: string;
  /** Human label shown in the multiselect prompt. */
  label: string;
  /** Short hint shown next to the label. */
  hint?: string;
  /** Selected by default in the prompt. */
  recommended?: boolean;
  /** Other module ids that must run before this one (auto-selected). */
  requires?: string[];
  /** Apply the module to an already-generated project. */
  apply: (ctx: ProjectContext) => Promise<void>;
}

export interface AppType {
  /** Stable identifier. */
  id: string;
  /** Human label shown in the initial select prompt. */
  label: string;
  /** Short hint shown next to the label. */
  hint?: string;
  /** Generate the base project into `ctx.dir`. */
  generate: (ctx: ProjectContext) => Promise<void>;
  /** Opt-in modules offered after the base project is generated. */
  modules: Module[];
}
