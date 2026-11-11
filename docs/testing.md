# Testing and verified results

English | [简体中文](testing.zh-CN.md)

## Unit checks

```sh
npm run check
```

The unit suite validates command invocation, eight-tool registration, `allowedRoots`, nested asset/output protection, output-symlink rejection, and conversion of Timeline Studio `ok:false` responses into Harness tool errors.

## End-to-end test

```sh
TIMELINE_STUDIO_ROOT=/absolute/path/to/web_player npm run test:e2e
```

The test uses the real Cordis `Context`, `@deepseek-ai/dsh-system-prompt`, and `@deepseek-ai/dsh-tools` 0.1.1-rc.2 execution pipeline. It performs this workflow without an LLM or API key:

1. Mount the production plugin and verify all eight model-visible schemas.
2. Create a portable `.timeline` archive in a temporary directory.
3. Inspect revision 0 and the original 16:9 ratio.
4. Generate a real PNG with FFmpeg.
5. Diff a plan that imports the PNG, sets 9:16, and adds a review range. Verify that diff writes nothing.
6. Apply the plan and reopen the output project at revision 1.
7. Inspect the Visuals track, visual clip, transcript, and saved review range through Harness tools.
8. Render a real 180×320 MP4 through Timeline Studio.
9. Decode/probe the output with ffprobe and verify duration and dimensions.
10. Attempt an out-of-root read and verify Harness returns `isError: true`.

## Last verified environment

- Date: 2026-11-11
- Node.js: 24.11.1
- DeepSeek Harness tool packages: 0.1.1-rc.2
- Cordis: 4.0.1
- FFmpeg/ffprobe: 8.0.1
- Unit tests: 8 passed
- End-to-end tests: 1 passed
- DeepSeek Harness 0.2.2-rc.1 Web profile: clean bundle install, no peer dependency issues, eight mounted tools, and a successful marker read through the host's native executor.

All generated media and projects are written to the operating system temporary directory; no test media is retained in the repository.
