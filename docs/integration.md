# Installation and integration

## Recommended: install as a DSH bundle

```sh
dsh plugin --profile web add "github:MartinDelophy/dsh-timeline-studio-plugin#main"
```

Configure the local Timeline Studio checkout and allowed project directory when launching:

```sh
TIMELINE_STUDIO_ROOT=/absolute/path/to/web_player \
TIMELINE_PROJECTS_ROOT=/absolute/path/to/projects \
dsh --profile web
```

The bundle remains disabled until `TIMELINE_STUDIO_ROOT` is present; restart after setting it to mount the plugin.

English | [简体中文](integration.zh-CN.md)

## Architecture

The plugin is a thin Host adapter. DeepSeek Harness owns tool discovery, validation, cancellation, and result handling. The adapter launches Timeline Studio's existing `scripts/timeline-command.mjs`, while the Timeline Studio repository remains the owner of `.timeline` parsing, command validation, transactional edits, and rendering.

This separation prevents the CLI, Harness plugin, and browser editor from developing three different editing implementations.

## Configuration

```yaml
- name: 'dsh-timeline-studio-plugin'
  config:
    timelineStudioRoot: /Users/me/Desktop/web_player
    allowedRoots:
      - /Users/me/Movies/timeline-projects
      - /Users/me/Desktop/client-assets
    nodeCommand: /absolute/path/to/node
    maxOutputBytes: 8388608
```

| Field | Required | Meaning |
|---|---:|---|
| `timelineStudioRoot` | Yes | Absolute path to the Timeline Studio checkout containing `scripts/timeline-command.mjs`. |
| `allowedRoots` | Recommended | Absolute directories the tools may read from or write to. Defaults to the Harness process working directory. |
| `nodeCommand` | No | Node executable used for the Timeline Studio command process. Defaults to `process.execPath`. |
| `maxOutputBytes` | No | Maximum captured JSON output; defaults to 8 MiB. |

Existing input paths are resolved with `realpath`. Output symlinks are rejected, and output parents are resolved before execution. A nested plan cannot bypass the boundary through `project`, `output.project`, `output.video`, or `asset.import.file`.

## Skill installation

DeepSeek Harness discovers project skills from `<projectRoot>/.dsh/skills`. This repository already contains `.dsh/skills/edit-timeline-studio`.

When the npm plugin is linked into another Harness workspace, copy or link the complete skill directory into that workspace. Keep its `references`, `docs`, and `scripts` subdirectories together with `SKILL.md`.

## Capability boundary

The command path currently supports portable project inspection, registered edit operations, media import, and the documented Visuals + Voiceover + Music MP4 renderer. AI generation, visible captions, stickers, overlays, advanced effects, and other browser-render-only features remain in the editor. Rendering rejects unsupported composition features instead of omitting them.

## Version policy

The plugin is validated against DeepSeek Harness `0.1.0-rc.6`, `@deepseek-ai/dsh-tools` `0.1.0-rc.6`, and Cordis `4.0.1`. Because Harness is a Developer Preview, upgrade these packages intentionally and rerun both `npm run check` and `npm run test:e2e`.
