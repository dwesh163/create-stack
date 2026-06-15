# create-stack

Interactive CLI to scaffold apps with sensible, opt-in modules. Runs directly
with [Bun](https://bun.sh) — no build step.

```bash
bunx create-stack
```

## What it does

1. Asks **what** to create (currently **Next.js** or **Expo** — the registry is
   designed to grow).
2. Asks the **project name**.
3. For Next.js, lets you pick **opt-in modules** (recommended ones pre-selected).
4. Scaffolds the base app, then applies the chosen modules.

## App types

| Type        | Base command                  |
| ----------- | ----------------------------- |
| **Next.js** | `create-next-app` (TypeScript, App Router, `src/`, Tailwind, `@/*` alias) — ESLint swapped for **Biome** |
| **Expo**    | `create-expo-app` (default template) |

## Next.js modules

| Module                | What it adds |
| --------------------- | ------------ |
| **shadcn/ui**         | `shadcn init` + a first component, Tailwind theme tokens |
| **Standalone output** | `output: "standalone"` in `next.config.ts` |
| **Dockerfile**        | Multi-stage Bun image serving the standalone build (requires *Standalone*) |
| **GitHub Actions**    | Biome lint + Docker build/push to **GHCR** on PRs, release on version bump |
| **VS Code settings**  | Biome as default formatter, format + fix on save |
| **Authentication**    | `next-auth` v5 (Microsoft Entra ID), JWT sessions, `proxy.ts` route guard |
| **Internationalization** | `next-intl` (en/fr, default fr), cookie + `Accept-Language` detection |
| **Prisma ORM**        | `schema.prisma` + hot-reload-safe client singleton |

Modules with prerequisites (e.g. Docker → Standalone) auto-select their
dependencies.

## Architecture

```
src/
  index.ts            # prompt flow (clack)
  registry/           # app-type registry — add frameworks here
  generators/         # next.ts, expo.ts
  modules/            # one file per Next.js module
  utils/              # exec, fs, package-manager, logger helpers
templates/            # files copied verbatim into generated projects
```

Adding a framework = implement an `AppType` and push it into
`src/registry/index.ts`. Adding a Next.js module = implement a `Module` and add
it to `src/modules/index.ts`.

## Development

```bash
bun install
bun start                 # run the CLI locally
bun run scripts/e2e.ts /tmp/demo   # non-interactive: scaffold Next + all modules
bun run lint
```
