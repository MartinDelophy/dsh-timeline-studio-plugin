import { createTimelineCommandRunner } from "./command-runner.js";

export const name = "timeline-studio";
export const inject = ["tools"];

const jsonOutput = {
  schema: { type: "object", additionalProperties: true },
  render: (_args, value) => [{ type: "text", text: JSON.stringify(value, null, 2) }],
};

// The host owns the tools service. Raw registrations avoid a second copy of
// Harness core and work in profiles where pnpm does not install peers.
function tool({ parameters, execute, ...spec }) {
  const required = Object.keys(parameters).filter((name) => parameters[name].required);
  const properties = Object.fromEntries(
    Object.entries(parameters).map(([name, { type, description }]) => [name, { type, description }]),
  );

  return {
    ...spec,
    parameters: { type: "object", properties, required, additionalProperties: false },
    output: jsonOutput,
    async execute(args, context) {
      if (!args || typeof args !== "object" || Array.isArray(args)) {
        throw new TypeError("Tool arguments must be an object");
      }
      for (const [name, value] of Object.entries(args)) {
        if (!Object.hasOwn(properties, name)) throw new TypeError("Unknown tool argument: " + name);
        if (typeof value !== properties[name].type) {
          throw new TypeError(name + " must be a " + properties[name].type);
        }
      }
      for (const name of required) {
        if (!Object.hasOwn(args, name)) throw new TypeError("Missing tool argument: " + name);
      }
      return execute(args, context);
    },
  };
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
        track: { type: "string", required: true, description: "Timeline track name, such as visuals, audio, captions, music, stickers, overlays, or effects" },
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
      name: "timeline_studio_marker_inspect",
      description: "Inspect Timeline Studio markers, chapters, ranges and notes, or read one annotation by its stable ID.",
      parameters: {
        project: { type: "string", required: true, description: "Absolute path to an existing .timeline project inside allowedRoots" },
        markerId: { type: "string", description: "Optional stable annotation ID; omit to read all markers" },
      },
      execute: (args, exec) => runner.execute("marker.inspect", args.project, args.markerId, exec.signal),
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
      description: "Render and verify the supported portable Timeline Studio subset to H.264/AAC MP4. Use the browser editor to export timeline effects, overlays, templates, or audio fades.",
      parameters: {
        request: { type: "string", required: true, description: "Absolute path to a render-request JSON file inside allowedRoots" },
      },
      execute: (args, exec) => runner.execute("project.render", args.request, undefined, exec.signal),
    }),
  ];

  for (const registration of registrations) ctx.tools.register(registration);
}
