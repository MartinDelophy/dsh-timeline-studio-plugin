# Tool reference

English | [简体中文](tools.zh-CN.md)

All path arguments must be absolute and must resolve inside `allowedRoots`. Tool failures are returned through the Harness pipeline with `isError: true`.

| Tool | Arguments | Result |
|---|---|---|
| `timeline_studio_project_inspect` | `project` | Revision, duration, ratio, track counts, media inventory, operation IDs, and warnings. |
| `timeline_studio_track_inspect` | `project`, `track` | Ordered timing summaries for one track. |
| `timeline_studio_clip_inspect` | `project`, `clipId` | Clip source mapping, timing, links, transforms, and serialized properties. |
| `timeline_studio_transcript_inspect` | `project`, optional `audioClipId` | Caption segments, words, speakers, timing, and audio associations. |
| `timeline_studio_marker_inspect` | `project`, optional `markerId` | Markers, chapters, ranges, and notes sorted by project time, or one annotation by ID. |
| `timeline_studio_project_diff` | `plan` | Semantic dry run using the real command registry; never writes the output project. |
| `timeline_studio_project_apply` | `plan` | Transactional project write after revision and operation validation. |
| `timeline_studio_project_render` | `request` | Verified H.264/AAC MP4 for the supported portable subset. |

## Edit plan

```json
{
  "schemaVersion": 1,
  "project": "/projects/input.timeline",
  "baseRevision": 0,
  "dryRun": false,
  "operations": [
    {
      "id": "set-ratio-001",
      "type": "project.set_ratio",
      "ratio": "9:16"
    }
  ],
  "output": {
    "project": "/projects/output.timeline"
  }
}
```

Always call `timeline_studio_project_diff` before `timeline_studio_project_apply`. A successful non-empty batch increments the project revision once. Reused operation IDs are no-ops, while a stale revision with new operations fails.

Use `marker.add`, `marker.update`, and `marker.delete` in edit plans. Inspect the resulting annotations after apply. Markers do not extend the project render.

Use `clip.set_property` with `fadeIn` or `fadeOut` (seconds) to store an audio or music clip fade in the project. Open the edited archive in Timeline Studio for audible verification and export.

## Render request

```json
{
  "schemaVersion": 1,
  "project": "/projects/output.timeline",
  "output": {
    "video": "/renders/output.mp4"
  },
  "render": {
    "width": 1080,
    "height": 1920,
    "frameRate": 30,
    "crf": 18,
    "preset": "medium"
  }
}
```

The portable renderer verifies the container, dimensions, duration, and audio presence. Export in the editor for audio fades, timeline effects, overlays, or beat templates.
