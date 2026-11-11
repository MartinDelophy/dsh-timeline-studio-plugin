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

将 `TIMELINE_STUDIO_ROOT` 设为包含 `scripts/timeline-command.mjs` 的仓库根目录，然后重启 Harness。未设置时 Bundle 保持禁用。

Windows 用户可在 PowerShell 中启动。

```powershell
$env:TIMELINE_STUDIO_ROOT = 'C:\dev\web_player'
$env:TIMELINE_PROJECTS_ROOT = 'C:\media\projects'
dsh --profile web
```

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

在 Harness 用户目录下的 `profiles/web/node_modules/dsh-timeline-studio-plugin/.dsh/skills/edit-timeline-studio` 找到随包 Skill。把该目录复制到工作区的 `.dsh/skills`，或复制到 `$DSH_HOME/skills`（默认 `~/.dsh/skills`）供所有工作区使用。请保留 `SKILL.md` 及其 `references`、`docs`、`scripts` 子目录。升级 Bundle 后同步更新这份副本。

## 能力边界

命令路径目前支持便携工程检查、已注册编辑操作、媒体导入，以及文档规定的 Visuals + Voiceover + Music MP4 渲染。音效库、高级合成、卡点模板追加和保留淡入淡出的成片导出均在编辑器中完成。通过 WebMCP 追加模板也在已打开的编辑器里执行。

## 版本策略

插件直接使用宿主的 `tools` 服务，安装包不携带 Harness 运行时依赖。已验证版本和验证步骤见[测试文档](testing.zh-CN.md)。
