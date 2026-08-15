import { defineTool } from "@deepseek-ai/dsh-tools";
import { createTimelineCommandRunner } from "./command-runner.js";

export const name = "timeline-studio";
export const inject = ["tools"];

const jsonOutput = {
  schema: { type: "object", additionalProperties: true },
  render: (_args, value) => [{ type: "text", text: JSON.stringify(value, null, 2) }],
};

function tool(spec) {
  return defineTool({ ...spec, output: jsonOutput });
}

export async function apply(ctx, config = {}) {
  if (typeof config.timelineStudioRoot !== "string" || !config.timelineStudioRoot) {
    throw new Error("timelineStudioRoot is required");
  }
  if (config.allowedRoots !== undefined && !Array.isArray(config.allowedRoots)) {
    throw new Error("allowedRoots must be an array of absolute directory paths");
  }

  const runner = await createTimelineCommandRunner(config);

  const registrations = [
    tool({
      name: "timeline_studio_project_inspect",
      description: "Inspect a portable Timeline Studio .timeline project without modifying it. Returns revision, duration, ratio, tracks, media inventory, applied operation IDs, and warnings.",
      parameters: {
        project: { type: "string", required: true, description: "Absolute path to an existing .timeline project inside allowedRoots" },
      },
      execute: (args, exec) => runner.execute("project.inspect", args.project, undefined, exec.signal),
    }),
    tool({
      name: "timeline_studio_track_inspect",
      description: "Inspect one Timeline Studio track and return its ordered clip timing summaries.",
      parameters: {
        project: { type: "string", required: true, description: "Absolute path to an existing .timeline project" },
        track: { type: "string", required: true, description: "Timeline track name, such as visuals, audio, captions, music, stickers, or overlay" },
      },
      execute: (args, exec) => runner.execute("track.inspect", args.project, args.track, exec.signal),
    }),
    tool({
      name: "timeline_studio_clip_inspect",
      description: "Inspect a Timeline Studio clip by stable ID, including timing, source mapping, links, transforms, and effects.",
      parameters: {
        project: { type: "string", required: true, description: "Absolute path to an existing .timeline project" },
        clipId: { type: "string", required: true, description: "Stable clip ID" },
      },
      execute: (args, exec) => runner.execute("clip.inspect", args.project, args.clipId, exec.signal),
    }),
    tool({
      name: "timeline_studio_transcript_inspect",
      description: "Inspect captions/transcript timing and audio associations in a Timeline Studio project.",
      parameters: {
        project: { type: "string", required: true, description: "Absolute path to an existing .timeline project" },
        audioClipId: { type: "string", description: "Optional audio clip ID; omit to inspect all captions" },
      },
      execute: (args, exec) => runner.execute("transcript.inspect", args.project, args.audioClipId, exec.signal),
    }),
    tool({
      name: "timeline_studio_project_diff",
      description: "Semantically validate and dry-run a versioned Timeline Studio edit plan. Always call this before timeline_studio_project_apply. It never writes the project.",
      parameters: {
        plan: { type: "string", required: true, description: "Absolute path to an edit-plan JSON file inside allowedRoots" },
      },
      execute: (args, exec) => runner.execute("project.diff", args.plan, undefined, exec.signal),
    }),
    tool({
      name: "timeline_studio_project_apply",
      description: "Transactionally apply a previously validated Timeline Studio edit plan. The plan must use a base revision, stable operation IDs, and an explicit output project path. Never use this before a successful diff.",
      parameters: {
        plan: { type: "string", required: true, description: "Absolute path to a versioned edit-plan JSON file inside allowedRoots" },
      },
      execute: (args, exec) => runner.execute("project.run", args.plan, undefined, exec.signal),
    }),
    tool({
      name: "timeline_studio_project_render",
      description: "Render and verify the supported portable Timeline Studio subset to H.264/AAC MP4. The renderer fails instead of silently dropping unsupported visible features.",
      parameters: {
        request: { type: "string", required: true, description: "Absolute path to a render-request JSON file inside allowedRoots" },
      },
      execute: (args, exec) => runner.execute("project.render", args.request, undefined, exec.signal),
    }),
  ];

  for (const registration of registrations) ctx.tools.register(registration);
}
