#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.dirname(scriptDir);
const manifest = JSON.parse(readFileSync(path.join(skillDir, "host-requirements.json"), "utf8"));
const dataRoot =
  process.platform === "win32"
    ? process.env.LOCALAPPDATA || os.homedir()
    : path.join(os.homedir(), ".local", "share");
const runtimeRoot =
  process.env.TIMELINE_STUDIO_SKILL_RUNTIME || path.join(dataRoot, manifest.runtimeHome);
const venvPython =
  process.platform === "win32"
    ? path.join(runtimeRoot, "python", "Scripts", "python.exe")
    : path.join(runtimeRoot, "python", "bin", "python");

function usable(command) {
  const imports = manifest.pythonPackages.map((item) => item.import).join(",");
  return spawnSync(command, ["-c", `import ${imports}`], { stdio: "ignore" }).status === 0;
}

const candidates = [
  venvPython,
  process.env.TIMELINE_STUDIO_PYTHON,
  "python3.11",
  "python3",
  "python",
].filter(Boolean);
const python = candidates.find(
  (candidate) => (path.isAbsolute(candidate) ? existsSync(candidate) : true) && usable(candidate),
);
if (!python) {
  console.error(
    "Timeline Studio Python analysis environment is unavailable. Run: node scripts/setup-host.mjs --check",
  );
  process.exit(2);
}
if (process.argv.length < 3) {
  console.error("Usage: node scripts/run-host-python.mjs <script.py> [...args]");
  process.exit(2);
}
const result = spawnSync(python, process.argv.slice(2), { stdio: "inherit" });
process.exit(result.status ?? 1);
