# Relighting and depth-video conversion

Use this workflow for depth-assisted video/image lighting or converting a video into grayscale relative depth. These are different outcomes: relighting retains editable lighting parameters on the source clip; depth conversion creates a new video asset. Relative depth is not metric geometry, a 3D reconstruction, or a generative change to the source scene.

## Live browser execution

Discover `timeline_ai_capabilities` and inspect the project and exact Visuals/Overlay `clipId`. Do not infer the target from the current UI selection. WebGPU and a model worker are required. Prepare never downloads or runs models. Start only when model downloads are authorized, with `allowModelDownload: true`; reuse the same caller-chosen `requestId` when retrying that start.

1. Inspect the clip and source timing. Preserve trims and source-time speed curves; the shared production sampler uses `getVisualSourceTime`. Check track locks and media readiness.
2. `timeline_ai_prepare` with the current `stateToken` and one of:
   - `{kind: "relight-analysis", clipId, quality: "balanced"}` for image or video lighting.
   - `{kind: "depth-map", clipId, quality: "balanced", inverted: false}` for video conversion.
   Optional `reanalyze: true` forces fresh analysis. Quality is `fast` (8 samples/s), `balanced` (16), or `quality` (24); long clips are bounded to 720 samples, so actual sampling can be lower. Output depth video is 24 fps; Fast/Standard reuse real RIFE interpolation, Fine uses depth blending.
3. Review the resolved source, quality, delivery and cache reuse. Call `timeline_ai_start` with the returned `aiId`, unique `requestId` and explicit download permission. Poll `timeline_ai_inspect`; only `succeeded` establishes completion. On cancellation, call `timeline_ai_cancel` and inspect until terminal. A complete depth analysis can remain reusable after cancelled/failed encoding; this does not mean a video asset was delivered.
4. For relighting, inspect again after analysis. `timeline_clip_inspect.depthAnalysis.readyQualities` must contain the requested quality. Preview `clip.set_relight` with the same quality, explicit `enabled: true`, and restrained `light` values. Review its semantic diff and apply that exact `previewId`. Analysis alone does not enable lighting.
5. For depth video, inspect the returned `assetIds` in My assets. The Agent route never replaces the source or inserts automatically. Insert through a separate reviewed `asset.insert`/`visual.insert`/`overlay.add` plan when required. Keep the original source available. Do not confuse this with the manual UI conversion's source-replacement behavior.
6. Sample representative timeline frames, cuts, faces, fine silhouettes, fast movement and occlusions; reject flickering depth, halos, clipped highlights, unnatural face lighting or temporal instability. Use modest strength and soft falloff. Verify preview/export appearance and source-audio timing. Save an editable project copy before final export; use the existing export prepare/start/inspect/cancel workflow.

### Editable lighting parameters

`clip.set_relight` targets a main visual or overlay by `clipId`, with optional `enabled`, `quality`, and a nonempty `light` patch. At least one change is required. Parameters are strictly validated; unsupported values are rejected instead of clamped silently.

| Field | Range / meaning |
| --- | --- |
| `x` | −1…1, azimuth = x × 180° |
| `y` | −1…1, elevation = −y × 90° |
| `distance` | 1…4 |
| `strength` | 0…1 |
| `range` | 0.1…1 |
| `softness` | 0…1 |
| `color` | six-digit `#RRGGBB` |

Example operation (resolve the ID through inspection):

```json
{"type":"clip.set_relight","clipId":"<inspected>","enabled":true,"quality":"balanced","light":{"x":-0.2,"y":-0.28,"strength":0.35,"softness":0.7,"color":"#ffe5bf"}}
```

Enabling requires complete analysis for that exact source trim/speed/quality. Source changes during inference fail instead of overwriting a changed clip. Track locks reject analysis and parameter edits. Changing selection does not retarget a running job. Browser-session analysis is not a portable model cache: after reopening an archive, inspect readiness and reanalyze if needed.

## Local CLI / STDIO MCP boundary

`clip.set_relight` uses the shared command registry, so local project diff/apply can preserve and edit lighting settings. Always inspect and diff before writing a new archive. Local CLI/STDIO MCP does not execute depth inference or render these effects in the headless subset; do not claim it does. Use the live browser task route for analysis/conversion and browser export for rendered lighting. Never add a second model runner or compositor just for the transport.

The model route remains the owned, immutable Depth Anything V2 Small Q4F16 mirrors and production provider-independent cache. Do not add another download/cache or unpinned dependency.
