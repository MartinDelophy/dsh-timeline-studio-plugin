import assert from "node:assert/strict";
import { mkdtemp, mkdir, realpath, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createTimelineCommandRunner } from "../src/command-runner.js";

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "timeline-dsh-plugin-"));
  const studio = join(root, "studio");
  const projects = join(root, "projects");
  const outside = join(root, "outside");
  await mkdir(join(studio, "scripts"), { recursive: true });
  await mkdir(projects);
  await mkdir(outside);
  await writeFile(join(studio, "scripts", "timeline-command.mjs"), `
    const [command, request, selector] = process.argv.slice(2);
    process.stdout.write(JSON.stringify({ ok: true, command, request, selector: selector || null }));
  `);
  return { root, studio, projects, outside };
}

test("runs an inspect command through the Timeline Studio command entrypoint", async () => {
  const { studio, projects } = await fixture();
  const project = join(projects, "demo.timeline");
  await writeFile(project, "fixture");
  const runner = await createTimelineCommandRunner({ timelineStudioRoot: studio, allowedRoots: [projects] });
  const result = await runner.execute("project.inspect", project);
  assert.equal(result.ok, true);
  assert.equal(result.command, "project.inspect");
  assert.equal(result.request, await realpath(project));
});

test("registers the complete model-facing tool set", async () => {
  const { studio, projects } = await fixture();
  const { apply } = await import("../src/index.js");
  const registrations = [];
  await apply({ tools: { register(value) { registrations.push(value); } } }, {
    timelineStudioRoot: studio,
    allowedRoots: [projects],
  });
  assert.deepEqual(registrations.map((item) => item.name).sort(), [
    "timeline_studio_clip_inspect",
    "timeline_studio_project_apply",
    "timeline_studio_project_diff",
    "timeline_studio_project_inspect",
    "timeline_studio_project_render",
    "timeline_studio_track_inspect",
    "timeline_studio_transcript_inspect",
  ]);
});

test("rejects project paths outside allowedRoots", async () => {
  const { studio, projects, outside } = await fixture();
  const project = join(outside, "private.timeline");
  await writeFile(project, "fixture");
  const runner = await createTimelineCommandRunner({ timelineStudioRoot: studio, allowedRoots: [projects] });
  await assert.rejects(() => runner.execute("project.inspect", project), /outside the configured allowedRoots/);
});

test("rejects nested output paths that escape allowedRoots", async () => {
  const { studio, projects, outside } = await fixture();
  const project = join(projects, "demo.timeline");
  const plan = join(projects, "plan.json");
  await writeFile(project, "fixture");
  await writeFile(plan, JSON.stringify({
    schemaVersion: 1,
    project,
    baseRevision: 0,
    operations: [],
    output: { project: join(outside, "escaped.timeline") },
  }));
  const runner = await createTimelineCommandRunner({ timelineStudioRoot: studio, allowedRoots: [projects] });
  await assert.rejects(() => runner.execute("project.run", plan), /output\.project is outside/);
});

test("rejects imported assets that escape allowedRoots", async () => {
  const { studio, projects, outside } = await fixture();
  const project = join(projects, "demo.timeline");
  const secret = join(outside, "secret.mp4");
  const plan = join(projects, "plan.json");
  await writeFile(project, "fixture");
  await writeFile(secret, "fixture");
  await writeFile(plan, JSON.stringify({
    schemaVersion: 1,
    project,
    baseRevision: 0,
    operations: [{ id: "import-1", type: "asset.import", file: secret }],
  }));
  const runner = await createTimelineCommandRunner({ timelineStudioRoot: studio, allowedRoots: [projects] });
  await assert.rejects(() => runner.execute("project.diff", plan), /asset\.import import-1 file is outside/);
});

test("rejects an output symlink even when its parent is allowed", async () => {
  const { studio, projects, outside } = await fixture();
  const project = join(projects, "demo.timeline");
  const escaped = join(outside, "escaped.timeline");
  const linkedOutput = join(projects, "linked.timeline");
  const plan = join(projects, "plan.json");
  await writeFile(project, "fixture");
  await writeFile(escaped, "fixture");
  await symlink(escaped, linkedOutput);
  await writeFile(plan, JSON.stringify({
    schemaVersion: 1,
    project,
    baseRevision: 0,
    operations: [],
    output: { project: linkedOutput },
  }));
  const runner = await createTimelineCommandRunner({ timelineStudioRoot: studio, allowedRoots: [projects] });
  await assert.rejects(() => runner.execute("project.run", plan), /must not be a symbolic link/);
});

test("turns structured Timeline Studio command failures into tool errors", async () => {
  const { studio, projects } = await fixture();
  const project = join(projects, "demo.timeline");
  await writeFile(project, "fixture");
  await writeFile(join(studio, "scripts", "timeline-command.mjs"), `
    process.stdout.write(JSON.stringify({ ok: false, code: "INVALID_PROJECT", message: "broken archive" }));
    process.exitCode = 1;
  `);
  const runner = await createTimelineCommandRunner({ timelineStudioRoot: studio, allowedRoots: [projects] });
  await assert.rejects(() => runner.execute("project.inspect", project), /INVALID_PROJECT.*broken archive/);
});
