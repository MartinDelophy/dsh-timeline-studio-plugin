# 安装与接入

## 推荐：作为 DSH Bundle 安装

```sh
dsh plugin --profile web add "github:MartinDelophy/dsh-timeline-studio-plugin#main"
```

启动时配置本地 Timeline Studio 与允许访问的工程目录：

```sh
TIMELINE_STUDIO_ROOT=/绝对路径/web_player \
TIMELINE_PROJECTS_ROOT=/绝对路径/projects \
dsh --profile web
```

Bundle 未检测到 `TIMELINE_STUDIO_ROOT` 时会保持禁用；设置后重新启动即可挂载。

[English](integration.md) | 简体中文

## 架构

本插件是轻量 Host 适配层。DeepSeek Harness 负责工具发现、参数校验、取消和结果处理；适配层调用 Timeline Studio 已有的 `scripts/timeline-command.mjs`；`.timeline` 解析、命令校验、事务编辑和渲染仍由 Timeline Studio 仓库统一负责。

这种分层可以避免 CLI、Harness 插件和浏览器编辑器逐渐形成三套不同的编辑逻辑。

## 配置

```yaml
- name: 'dsh-timeline-studio-plugin'
  config:
    timelineStudioRoot: /Users/me/Desktop/web_player
    allowedRoots:
      - /Users/me/Movies/timeline-projects
      - /Users/me/Desktop/client-assets
    nodeCommand: /绝对路径/node
    maxOutputBytes: 8388608
```

| 字段 | 必填 | 含义 |
|---|---:|---|
| `timelineStudioRoot` | 是 | Timeline Studio 仓库绝对路径，其中必须包含 `scripts/timeline-command.mjs`。 |
| `allowedRoots` | 建议配置 | 工具允许读取或写入的绝对目录；默认是 Harness 进程工作目录。 |
| `nodeCommand` | 否 | 启动 Timeline Studio 命令进程使用的 Node；默认是 `process.execPath`。 |
| `maxOutputBytes` | 否 | 捕获 JSON 输出的最大字节数；默认 8 MiB。 |

已有输入路径会经过 `realpath` 解析；输出符号链接会被拒绝，输出父目录也会在执行前解析。编辑计划中的 `project`、`output.project`、`output.video` 和 `asset.import.file` 都不能绕过安全边界。

## Skill 安装

DeepSeek Harness 会从 `<projectRoot>/.dsh/skills` 发现项目 Skill。本仓库已经包含 `.dsh/skills/edit-timeline-studio`。

如果把 npm 插件链接到另一个 Harness 工作区，需要把完整 Skill 目录复制或链接到目标工作区。`SKILL.md` 必须和其中的 `references`、`docs`、`scripts` 子目录一起保留。

## 能力边界

命令路径目前支持便携工程检查、已注册编辑操作、媒体导入，以及文档规定的 Visuals + Voiceover + Music MP4 渲染。AI 生成、可见字幕、贴纸、叠加层、高级效果和其他仅浏览器渲染能力仍由编辑器执行。遇到不支持的合成特性时，渲染会明确失败，不会静默省略。

## 版本策略

插件已针对 DeepSeek Harness `0.1.0-rc.6`、`@deepseek-ai/dsh-tools` `0.1.0-rc.6` 和 Cordis `4.0.1` 完成验证。Harness 仍处于 Developer Preview，升级这些包时应明确修改版本，并重新运行 `npm run check` 与 `npm run test:e2e`。
