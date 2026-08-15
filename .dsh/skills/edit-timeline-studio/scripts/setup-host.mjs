#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.dirname(scriptDir);
const manifest = JSON.parse(readFileSync(path.join(skillDir, "host-requirements.json"), "utf8"));
const args = new Set(process.argv.slice(2));
const install = args.has("--install");
const json = args.has("--json");
const assumeYes = args.has("--yes");
const capabilityArgIndex = process.argv.indexOf("--capability");
const requestedCapability =
  capabilityArgIndex >= 0 ? process.argv[capabilityArgIndex + 1] : null;
if (requestedCapability && !manifest.optionalCapabilities?.[requestedCapability]) {
  console.error(`Unknown capability: ${requestedCapability}`);
  process.exit(2);
}
const capability = requestedCapability
  ? manifest.optionalCapabilities[requestedCapability]
  : null;
const dataRoot =
  process.platform === "win32"
    ? process.env.LOCALAPPDATA || os.homedir()
    : path.join(os.homedir(), ".local", "share");
const runtimeRoot =
  process.env.TIMELINE_STUDIO_SKILL_RUNTIME || path.join(dataRoot, manifest.runtimeHome);
const venvDir = path.join(runtimeRoot, "python");
const venvPython =
  process.platform === "win32"
    ? path.join(venvDir, "Scripts", "python.exe")
    : path.join(venvDir, "bin", "python");
const capabilityVenvDir = capability
  ? path.join(runtimeRoot, capability.runtimeDirectory)
  : null;
const capabilityPython = capabilityVenvDir
  ? process.platform === "win32"
    ? path.join(capabilityVenvDir, "Scripts", "python.exe")
    : path.join(capabilityVenvDir, "bin", "python")
  : null;

function run(command, commandArgs, options = {}) {
  return spawnSync(command, commandArgs, { encoding: "utf8", ...options });
}

function commandVersion(commands, versionArgs = ["--version"]) {
  for (const command of commands) {
    const result = run(command, versionArgs);
    if (result.status === 0) {
      const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
      const match = output.match(/(\d+)\.(\d+)(?:\.(\d+))?/);
      return {
        command,
        available: true,
        version: match ? `${match[1]}.${match[2]}.${match[3] || 0}` : null,
        output: output.split("\n")[0],
      };
    }
  }
  return { command: commands[0], available: false, version: null, output: null };
}

function compareVersions(actual, minimum) {
  if (!actual) return false;
  const left = actual.split(".").map(Number);
  const right = minimum.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    if ((left[index] || 0) > (right[index] || 0)) return true;
    if ((left[index] || 0) < (right[index] || 0)) return false;
  }
  return true;
}

function compatibleCapabilityPython() {
  if (!capability) return null;
  for (const command of ["python3.11", "python3.10", "python3.9", "python3", "python"]) {
    const detected = commandVersion([command], ["--version"]);
    if (
      detected.available &&
      compareVersions(detected.version, capability.pythonMinimumVersion) &&
      compareVersions(capability.pythonMaximumVersion, detected.version)
    )
      return detected;
  }
  return null;
}

function inspectCapability() {
  if (!capability) return null;
  const candidates = [capabilityPython].filter(Boolean);
  for (const python of candidates) {
    if (path.isAbsolute(python) && !existsSync(python)) continue;
    const detected = commandVersion([python], ["--version"]);
    const inRange =
      detected.available &&
      compareVersions(detected.version, capability.pythonMinimumVersion) &&
      compareVersions(capability.pythonMaximumVersion, detected.version);
    if (!inRange) continue;
    const code = [
      "import importlib, json",
      `items = ${JSON.stringify(capability.imports)}`,
      "out = []",
      "for item in items:",
      "    try:",
      "        importlib.import_module(item)",
      "        out.append({'import': item, 'available': True})",
      "    except Exception as exc:",
      "        out.append({'import': item, 'available': False, 'error': str(exc)})",
      "print(json.dumps({'imports': out}))",
    ].join("\n");
    const result = run(python, ["-c", code]);
    if (result.status !== 0) continue;
    const details = JSON.parse(result.stdout);
    return {
      id: requestedCapability,
      purpose: capability.purpose,
      python,
      version: detected.version,
      imports: details.imports,
      satisfied: details.imports.every((item) => item.available),
    };
  }
  return {
    id: requestedCapability,
    purpose: capability.purpose,
    python: capabilityPython,
    version: null,
    imports: capability.imports.map((item) => ({ import: item, available: false })),
    satisfied: false,
  };
}

function inspect() {
  const commands = manifest.requiredCommands.map((requirement) => {
    const candidates = requirement.commands || [requirement.command];
    const versionArgs =
      requirement.id === "node" || requirement.id === "python" ? ["--version"] : ["-version"];
    const detected = commandVersion(candidates, versionArgs);
    return {
      ...requirement,
      ...detected,
      satisfied:
        detected.available && compareVersions(detected.version, requirement.minimumVersion),
    };
  });
  const detectedPython = commands.find((item) => item.id === "python")?.command;
  const candidates = [venvPython, process.env.TIMELINE_STUDIO_PYTHON, detectedPython].filter(
    Boolean,
  );
  let pythonPackages = { python: null, satisfied: false, packages: [] };
  for (const python of candidates) {
    if (path.isAbsolute(python) && !existsSync(python)) continue;
    const code = [
      "import importlib, json",
      `items = ${JSON.stringify(manifest.pythonPackages)}`,
      "out = []",
      "for item in items:",
      "    try:",
      "        module = importlib.import_module(item['import'])",
      "        out.append({'distribution': item['distribution'], 'import': item['import'], 'available': True, 'version': getattr(module, '__version__', None)})",
      "    except Exception as exc:",
      "        out.append({'distribution': item['distribution'], 'import': item['import'], 'available': False, 'error': str(exc)})",
      "print(json.dumps(out))",
    ].join("\n");
    const result = run(python, ["-c", code]);
    if (result.status !== 0) continue;
    const packages = JSON.parse(result.stdout);
    pythonPackages = { python, satisfied: packages.every((item) => item.available), packages };
    if (pythonPackages.satisfied) break;
  }
  const optionalCapability = inspectCapability();
  return {
    schemaVersion: 1,
    platform: process.platform,
    runtimeRoot,
    commands,
    pythonPackages,
    optionalCapability,
    satisfied:
      commands.every((item) => item.satisfied) &&
      pythonPackages.satisfied &&
      (!optionalCapability || optionalCapability.satisfied),
    neverAutomatic: manifest.neverAutomatic,
  };
}

function printReport(report) {
  if (json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }
  console.log("Timeline Studio host environment");
  for (const item of report.commands) {
    console.log(
      `${item.satisfied ? "✓" : "✗"} ${item.id}: ${item.version || "missing"} (requires >= ${item.minimumVersion}) — ${item.purpose}`,
    );
  }
  for (const item of report.pythonPackages.packages) {
    console.log(
      `${item.available ? "✓" : "✗"} Python ${item.distribution}: ${item.version || "missing"}`,
    );
  }
  if (!report.pythonPackages.packages.length)
    console.log("✗ Python analysis packages: unavailable");
  if (report.optionalCapability) {
    console.log(
      `${report.optionalCapability.satisfied ? "✓" : "✗"} ${report.optionalCapability.id}: ${report.optionalCapability.satisfied ? "ready" : "unavailable"} — ${report.optionalCapability.purpose}`,
    );
  }
  console.log(`Runtime: ${report.runtimeRoot}`);
  console.log(
    report.satisfied
      ? "Environment ready."
      : "Environment incomplete. Review the plan before using --install.",
  );
}

function packagePlan(report) {
  const missing = new Set(report.commands.filter((item) => !item.satisfied).map((item) => item.id));
  const capabilityPythonMissing = Boolean(capability && !compatibleCapabilityPython());
  const plan = [];
  if (process.platform === "darwin") {
    if (!commandVersion(["brew"]).available)
      return {
        supported: false,
        reason: "Homebrew is required for automatic macOS system-package installation.",
        plan,
      };
    if (missing.has("node")) plan.push(["brew", ["install", "node@22"]]);
    if (missing.has("ffmpeg") || missing.has("ffprobe")) plan.push(["brew", ["install", "ffmpeg"]]);
    if (missing.has("python")) plan.push(["brew", ["install", "python@3.11"]]);
    else if (capabilityPythonMissing) plan.push(["brew", ["install", "python@3.11"]]);
  } else if (process.platform === "linux") {
    if (!commandVersion(["apt-get"]).available)
      return {
        supported: false,
        reason: "Automatic Linux setup currently requires apt-get.",
        plan,
      };
    const packages = [];
    if (missing.has("node")) packages.push("nodejs", "npm");
    if (missing.has("ffmpeg") || missing.has("ffprobe")) packages.push("ffmpeg");
    if (missing.has("python") && capability)
      packages.push("python3.11", "python3.11-venv", "python3-pip");
    else if (missing.has("python")) packages.push("python3", "python3-venv", "python3-pip");
    else if (capabilityPythonMissing)
      packages.push("python3.11", "python3.11-venv", "python3-pip");
    if (packages.length) {
      plan.push(["sudo", ["apt-get", "update"]]);
      plan.push(["sudo", ["apt-get", "install", "-y", ...packages]]);
    }
  } else if (process.platform === "win32") {
    if (!commandVersion(["winget"]).available)
      return {
        supported: false,
        reason: "Automatic Windows setup currently requires winget.",
        plan,
      };
    if (missing.has("node"))
      plan.push(["winget", ["install", "--id", "OpenJS.NodeJS.LTS", "--exact"]]);
    if (missing.has("ffmpeg") || missing.has("ffprobe"))
      plan.push(["winget", ["install", "--id", "Gyan.FFmpeg", "--exact"]]);
    if (missing.has("python"))
      plan.push(["winget", ["install", "--id", "Python.Python.3.11", "--exact"]]);
    else if (capabilityPythonMissing)
      plan.push(["winget", ["install", "--id", "Python.Python.3.11", "--exact"]]);
  } else {
    return {
      supported: false,
      reason: `No automatic package-manager route for ${process.platform}.`,
      plan,
    };
  }
  return { supported: true, reason: null, plan };
}

async function main() {
  const before = inspect();
  printReport(before);
  if (!install || before.satisfied) process.exit(before.satisfied ? 0 : 1);
  const systemPlan = packagePlan(before);
  if (!systemPlan.supported) {
    console.error(systemPlan.reason);
    process.exit(2);
  }
  console.log("\nProposed host changes:");
  for (const [command, commandArgs] of systemPlan.plan)
    console.log(`- ${command} ${commandArgs.join(" ")}`);
  console.log(`- create isolated Python environment at ${venvDir}`);
  console.log(
    `- install pinned packages from ${path.join(skillDir, "host-python-requirements.txt")}`,
  );
  if (capability) {
    console.log(`- create isolated ${requestedCapability} environment at ${capabilityVenvDir}`);
    console.log(
      `- install pinned packages from ${path.join(skillDir, capability.requirementsFile)}`,
    );
    console.log(`- run ${capabilityPython} ${capability.postInstall.join(" ")}`);
  }
  console.log("Large models, drivers, credentials, and paid services are excluded.");
  if (!assumeYes) {
    if (!process.stdin.isTTY) {
      console.error(
        "Installation requires an interactive confirmation. Re-run with --yes only after explicit user approval.",
      );
      process.exit(2);
    }
    const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await prompt.question("Apply this plan? [y/N] ");
    prompt.close();
    if (!/^y(es)?$/i.test(answer.trim())) process.exit(3);
  }
  for (const [command, commandArgs] of systemPlan.plan) {
    const result = spawnSync(command, commandArgs, { stdio: "inherit" });
    if (result.status !== 0) process.exit(result.status || 1);
  }
  const refreshed = inspect();
  const python = refreshed.commands.find((item) => item.id === "python")?.command;
  if (!python) {
    console.error("Python is still unavailable after system-package installation.");
    process.exit(2);
  }
  mkdirSync(runtimeRoot, { recursive: true });
  let result = spawnSync(python, ["-m", "venv", venvDir], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
  result = spawnSync(
    venvPython,
    [
      "-m",
      "pip",
      "install",
      "--disable-pip-version-check",
      "-r",
      path.join(skillDir, "host-python-requirements.txt"),
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(result.status || 1);
  if (capability) {
    const detected = compatibleCapabilityPython();
    if (!detected) {
      console.error(
        `${requestedCapability} requires Python ${capability.pythonMinimumVersion}–${capability.pythonMaximumVersion}, but no compatible interpreter is available after installation.`,
      );
      process.exit(2);
    }
    result = spawnSync(detected.command, ["-m", "venv", capabilityVenvDir], {
      stdio: "inherit",
    });
    if (result.status !== 0) process.exit(result.status || 1);
    result = spawnSync(
      capabilityPython,
      [
        "-m",
        "pip",
        "install",
        "--disable-pip-version-check",
        "-r",
        path.join(skillDir, capability.requirementsFile),
      ],
      { stdio: "inherit" },
    );
    if (result.status !== 0) process.exit(result.status || 1);
    result = spawnSync(capabilityPython, capability.postInstall, { stdio: "inherit" });
    if (result.status !== 0) process.exit(result.status || 1);
  }
  const after = inspect();
  printReport(after);
  process.exit(after.satisfied ? 0 : 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
