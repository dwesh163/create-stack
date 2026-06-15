import { expoApp } from "../generators/expo.ts";
import { nextApp } from "../generators/next.ts";
import type { AppType } from "../types.ts";

/**
 * Registry of supported app types. Add a new framework by implementing an
 * `AppType` and appending it here — the prompt flow picks it up automatically.
 */
export const appTypes: AppType[] = [nextApp, expoApp];

export function getAppType(id: string): AppType | undefined {
  return appTypes.find((t) => t.id === id);
}
