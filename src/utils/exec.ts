import { spawn } from "node:child_process";

export interface RunOptions {
  cwd?: string;
  /** Extra environment variables merged on top of process.env. */
  env?: Record<string, string>;
  /** Inherit stdio so the child command stays interactive/visible. */
  stdio?: "inherit" | "ignore";
}

/**
 * Run a command and resolve when it exits successfully, rejecting otherwise.
 * stdio is inherited by default so wrapped tools (create-next-app, shadcn, ...)
 * can print their own progress.
 */
export function run(command: string, args: string[], options: RunOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio: options.stdio ?? "inherit",
      env: options.env ? { ...process.env, ...options.env } : process.env,
      // Needed on Windows for npm/npx style shims; harmless elsewhere.
      shell: process.platform === "win32",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`\`${command} ${args.join(" ")}\` exited with code ${code}`));
    });
  });
}
