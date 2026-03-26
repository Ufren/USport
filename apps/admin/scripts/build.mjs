import { cpSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const distDir = resolve(root, "dist");

mkdirSync(distDir, { recursive: true });

execSync("tsc -p tsconfig.json", { stdio: "inherit", cwd: root });
cpSync(resolve(root, "src/index.html"), resolve(distDir, "index.html"), {
  force: true,
});
cpSync(resolve(root, "src/styles.css"), resolve(distDir, "styles.css"), {
  force: true,
});
