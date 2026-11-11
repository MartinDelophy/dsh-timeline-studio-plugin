import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { Context } from "@deepseek-ai/cordis";
import { CallId } from "@deepseek-ai/dsh-llm";
import systemPromptPlugin from "@deepseek-ai/dsh-system-prompt";
import toolsPlugin from "@deepseek-ai/dsh-tools";
import { strToU8, zipSync } from "fflate";
import * as timelinePlugin from "../src/index.js";

const execFileAsync = promisify(execFile);
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const timelineStudioRoot = process.env.TIMELINE_STUDIO_ROOT || resolve(projectRoot, "../web_player");

async function call(ctx, sequence, name, args) {
  return ctx.tools.execute({
    callId: CallId(`timeline-e2e-${sequence}`),
    name,
    arguments: args,
    signal: new AbortController().signal,
  });
}

async function createEmptyProject(path) {
  const payload = {
    format: "timeline-studio-archive",
    version: 3,
    project: {
      ratioId: "16:9",
      visualSegments: [],
      captionSegments: [],
      audioSegments: [],
      stickerSegments: [],
      visualOverlaySegments: [],
      musicSegments: [],
      commandState: { schemaVersion: 1, revision: 0, appliedOperationIds: [] },
    },
    media: {},
  };
  await writeFile(path, zipSync({ "project.json": strToU8(JSON.stringify(payload)) }, { level: 6 }));
}

test("DeepSeek Harness executes the complete Timeline Studio project workflow", async (context) => {
  await access(resolve(timelineStudioRoot, "scripts/timeline-command.mjs"));
  const artifacts = await mkdtemp(join(tmpdir(), "dsh-timeline-e2e-"));
  const inputProject = join(artifacts, "input.timeline");
  const outputProject = join(artifacts, "edited.timeline");
  const sourceImage = join(artifacts, "source.png");
  const planPath = join(artifacts, "plan.json");
  const renderPath = join(artifacts, "render.json");
  const outputVideo = join(artifacts, "edited.mp4");
  await createEmptyProject(inputProject);
  await execFileAsync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "color=c=0x2355ff:s=64x64", "-frames:v", "1", "-y", sourceImage]);
  await writeFile(planPath, JSON.stringify({
    schemaVersion: 1,
    project: inputProject,
    baseRevision: 0,
    dryRun: false,
    operations: [
      { id: "import-visual-001", type: "asset.import", file: sourceImage, track: "visuals", clipId: "visual-001", name: "E2E source", duration: 1, width: 64, height: 64 },
      { id: "set-ratio-001", type: "project.set_ratio", ratio: "9:16" },
      { id: "mark-review-001", type: "marker.add", markerId: "review", markerType: "range", time: 0.1, endTime: 0.6, title: "Review" },
    ],
    output: { project: outputProject },
  }, null, 2));
  await writeFile(renderPath, JSON.stringify({
    schemaVersion: 1,
    project: outputProject,
    output: { video: outputVideo },
    render: { width: 180, height: 320, frameRate: 10, crf: 28, preset: "ultrafast" },
  }, null, 2));

  const harness = new Context();
  context.after(async () => harness.fiber.dispose());
  await harness.plugin(systemPromptPlugin);
  await harness.plugin(toolsPlugin);
  await harness.plugin(timelinePlugin, { timelineStudioRoot, allowedRoots: [artifacts] });

  const toolNames = harness.tools.schemas().map((schema) => schema.name).sort();
  assert.deepEqual(toolNames, [
    "timeline_studio_clip_inspect",
    "timeline_studio_marker_inspect",
    "timeline_studio_project_apply",
    "timeline_studio_project_diff",
    "timeline_studio_project_inspect",
    "timeline_studio_project_render",
    "timeline_studio_track_inspect",
    "timeline_studio_transcript_inspect",
  ]);

  const initial = await call(harness, 1, "timeline_studio_project_inspect", { project: inputProject });
  assert.equal(initial.isError, false);
  assert.equal(initial.value.revision, 0);
  assert.equal(initial.value.ratio, "16:9");

  const diff = await call(harness, 2, "timeline_studio_project_diff", { plan: planPath });
  assert.equal(diff.isError, false);
  assert.equal(diff.value.revision, 1);
  assert.deepEqual(diff.value.appliedOperationIds, ["import-visual-001", "set-ratio-001", "mark-review-001"]);
  assert.equal(diff.value.diff.changes.markers.added[0].id, "review");
  await assert.rejects(access(outputProject));

  const applied = await call(harness, 3, "timeline_studio_project_apply", { plan: planPath });
  assert.equal(applied.isError, false);
  assert.equal(applied.value.artifacts.project, outputProject);
  await access(outputProject);

  const inspected = await call(harness, 4, "timeline_studio_project_inspect", { project: outputProject });
  assert.equal(inspected.isError, false);
  assert.equal(inspected.value.revision, 1);
  assert.equal(inspected.value.ratio, "9:16");
  assert.equal(inspected.value.tracks.visuals, 1);

  const track = await call(harness, 5, "timeline_studio_track_inspect", { project: outputProject, track: "visuals" });
  assert.equal(track.isError, false);
  assert.equal(track.value.clipCount, 1);
  assert.equal(track.value.clips[0].id, "visual-001");

  const clip = await call(harness, 6, "timeline_studio_clip_inspect", { project: outputProject, clipId: "visual-001" });
  assert.equal(clip.isError, false);
  assert.equal(clip.value.track, "visuals");

  const transcript = await call(harness, 7, "timeline_studio_transcript_inspect", { project: outputProject });
  assert.equal(transcript.isError, false);
  assert.equal(transcript.value.segmentCount, 0);

  const render = await call(harness, 8, "timeline_studio_project_render", { request: renderPath });
  assert.equal(render.isError, false);
  assert.equal(render.value.verification.width, 180);
  assert.equal(render.value.verification.height, 320);
  assert.equal(render.value.verification.hasAudio, false);
  assert.ok((await stat(outputVideo)).size > 0);
  const { stdout: probeOutput } = await execFileAsync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height", "-of", "json", outputVideo]);
  const probe = JSON.parse(probeOutput);
  assert.ok(Number(probe.format.duration) > 0);
  assert.ok(probe.streams.some((stream) => stream.codec_type === "video" && stream.width === 180 && stream.height === 320));

  const denied = await call(harness, 9, "timeline_studio_project_inspect", { project: resolve(projectRoot, "package.json") });
  assert.equal(denied.isError, true);
  assert.match(denied.content[0].text, /outside the configured allowedRoots/);

  const marker = await call(harness, 10, "timeline_studio_marker_inspect", { project: outputProject, markerId: "review" });
  assert.equal(marker.isError, false);
  assert.equal(marker.value.markerCount, 1);
  assert.equal(marker.value.markers[0].time, 0.1);
  assert.equal(marker.value.markers[0].endTime, 0.6);

  const outputArchive = await readFile(outputProject);
  assert.ok(outputArchive.length > 0);
});
