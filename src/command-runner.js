import { execFile } from "node:child_process";
import { access, lstat, readFile, realpath } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const COMMANDS = new Set([
  "project.inspect",
  "track.inspect",
  "clip.inspect",
  "transcript.inspect",
  "marker.inspect",
  "project.diff",
  "project.run",
  "project.render",
]);

function isInside(root, candidate) {
  const delta = relative(root, candidate);
  return delta === "" || (!delta.startsWith(`..${sep}`) && delta !== ".." && !isAbsolute(delta));
}

async function canonicalExistingPath(path) {
  return realpath(resolve(path));
}

async function canonicalOutputPath(path) {
  const absolute = resolve(path);
  try {
    const stats = await lstat(absolute);
    if (stats.isSymbolicLink()) throw new Error("output path must not be a symbolic link");
    return realpath(absolute);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const canonicalParent = await realpath(dirname(absolute));
  return resolve(canonicalParent, absolute.slice(dirname(absolute).length + 1));
}

function parseJsonOutput(stdout, command) {
  const trimmed = String(stdout || "").trim();
  if (!trimmed) throw new Error(`${command} returned no JSON output`);
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    throw new Error(`${command} returned invalid JSON: ${error.message}`);
  }
}

function requireSuccessfulResult(value, command) {
  if (value?.ok !== false) return value;
  const error = new Error(`${command} failed${value.code ? ` [${value.code}]` : ""}: ${value.message || "Timeline Studio returned an error"}`);
  error.code = value.code || "TIMELINE_COMMAND_FAILED";
  error.timelineCommandResult = value;
  throw error;
}

export async function createTimelineCommandRunner(options) {
  if (typeof options?.timelineStudioRoot !== "string" || !isAbsolute(options.timelineStudioRoot)) {
    throw new Error("timelineStudioRoot must be an absolute path");
  }
  const timelineStudioRoot = await canonicalExistingPath(options.timelineStudioRoot);
  const commandScript = resolve(timelineStudioRoot, "scripts/timeline-command.mjs");
  await access(commandScript);

  const configuredRoots = options.allowedRoots?.length ? options.allowedRoots : [process.cwd()];
  if (configuredRoots.some((root) => typeof root !== "string" || !isAbsolute(root))) {
    throw new Error("allowedRoots must contain only absolute directory paths");
  }
  const allowedRoots = await Promise.all(configuredRoots.map(canonicalExistingPath));
  const nodeCommand = options.nodeCommand || process.execPath || "node";
  const maxBuffer = Number.isSafeInteger(options.maxOutputBytes) && options.maxOutputBytes > 0
    ? options.maxOutputBytes
    : 8 * 1024 * 1024;

  async function assertAllowedExisting(path, label) {
    if (typeof path !== "string" || !isAbsolute(path)) {
      throw new Error(`${label} must be an absolute path`);
    }
    const canonical = await canonicalExistingPath(path);
    if (!allowedRoots.some((root) => isInside(root, canonical))) {
      throw new Error(`${label} is outside the configured allowedRoots`);
    }
    return canonical;
  }

  async function assertAllowedOutput(path, label) {
    if (typeof path !== "string" || !isAbsolute(path)) {
      throw new Error(`${label} must be an absolute path`);
    }
    const canonical = await canonicalOutputPath(path);
    if (!allowedRoots.some((root) => isInside(root, canonical))) {
      throw new Error(`${label} is outside the configured allowedRoots`);
    }
    return canonical;
  }

  async function validateRequest(command, requestPath) {
    const canonicalRequest = await assertAllowedExisting(requestPath, "request file");
    if (command === "project.inspect" || command === "track.inspect" || command === "clip.inspect" || command === "transcript.inspect" || command === "marker.inspect") {
      return canonicalRequest;
    }

    const request = JSON.parse(await readFile(canonicalRequest, "utf8"));
    await assertAllowedExisting(request.project, "project");

    if (command === "project.diff" || command === "project.run") {
      for (const operation of request.operations || []) {
        if (operation?.type === "asset.import") {
          await assertAllowedExisting(operation.file, `asset.import ${operation.id || "operation"} file`);
        }
      }
      if (command === "project.run" && !request.dryRun) {
        await assertAllowedOutput(request.output?.project, "output.project");
      }
    }

    if (command === "project.render") {
      await assertAllowedOutput(request.output?.video, "output.video");
    }
    return canonicalRequest;
  }

  async function execute(command, requestPath, selector, signal) {
    if (!COMMANDS.has(command)) throw new Error(`Unsupported Timeline Studio command: ${command}`);
    const canonicalRequest = await validateRequest(command, requestPath);
    const args = [commandScript, command, canonicalRequest];
    if (selector) args.push(selector);

    try {
      const { stdout } = await execFileAsync(nodeCommand, args, {
        cwd: timelineStudioRoot,
        signal,
        maxBuffer,
        windowsHide: true,
      });
      return requireSuccessfulResult(parseJsonOutput(stdout, command), command);
    } catch (error) {
      if (signal?.aborted || error?.name === "AbortError") {
        throw new Error(`${command} was canceled`);
      }
      if (error?.timelineCommandResult) throw error;
      if (error?.stdout) return requireSuccessfulResult(parseJsonOutput(error.stdout, command), command);
      throw new Error(`${command} failed: ${error?.message || String(error)}`);
    }
  }

  return Object.freeze({ execute, timelineStudioRoot, allowedRoots: Object.freeze([...allowedRoots]) });
}
