import pc from "picocolors";

/** Thin wrapper so all step logging looks consistent across modules. */
export const logger = {
  step(message: string) {
    console.log(`${pc.cyan("›")} ${message}`);
  },
  success(message: string) {
    console.log(`${pc.green("✓")} ${message}`);
  },
  warn(message: string) {
    console.log(`${pc.yellow("!")} ${message}`);
  },
  error(message: string) {
    console.log(`${pc.red("✗")} ${message}`);
  },
  dim(message: string) {
    console.log(pc.dim(message));
  },
};
