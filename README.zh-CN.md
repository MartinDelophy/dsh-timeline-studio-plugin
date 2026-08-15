# Timeline Studio DeepSeek Harness 插件

[English](README.md) | 简体中文

`dsh-timeline-studio-plugin` 将 DeepSeek Harness 接入 Timeline Studio 的确定性 `.timeline` 命令层。项目同时携带完整的 `edit-timeline-studio` Agent Skill，让智能体既拥有可执行工具，也拥有安全使用这些工具所需的工作流规范。

> **本插件基于 [Timeline Studio](https://github.com/MartinDelophy/ai-video-editor) 构建。** Timeline Studio 是核心视频编辑器，负责可视化时间线、媒体处理、浏览器本地 AI 能力和最终创作体验；本仓库提供它与 DeepSeek Harness 之间的智能体自动化接入层。想了解完整产品、查看编辑器界面或参与核心功能开发，请前往 **[Timeline Studio 主仓库](https://github.com/MartinDelophy/ai-video-editor)**。

![从自然语言请求到可编辑 Timeline Studio 工程的四步流程](docs/images/player-flow.svg)

## 给玩家：它是什么？

它不是一个新的剪辑器界面，而是 DeepSeek Harness 与 Timeline Studio 之间的“操作桥梁”。玩家在 Harness 中用自然语言说明想做的事情，智能体就能读取本地 `.timeline` 工程、先预演改动，再安全地产生新的可编辑工程和 MP4。原工程默认不会被直接覆盖。

还没有 Timeline Studio？先访问 **[Timeline Studio 主仓库](https://github.com/MartinDelophy/ai-video-editor)** 获取编辑器。本插件不能替代编辑器运行，它会调用主仓库提供的 `.timeline` 命令与渲染能力。

![DeepSeek Harness 首页：先通过“添加工作区”选择包含 Timeline Studio 工程的本地目录](docs/images/deepseek-harness-home.png)

上图是插件的使用入口。第一次体验时：

1. 点击左侧工作区标题旁的 **添加工作区** 图标。
2. 选择包含 `.timeline` 工程和素材的本地文件夹。
3. 点击 **新会话**，直接描述目标；插件会在需要时由智能体自动调用。

### 确认插件已经生效

打开左下角 **设置 → 插件 → 插件列表**，搜索 `timeline`：

![DeepSeek Harness 插件列表中的 Timeline Studio 插件，配置状态为已启用且 Cordis 状态为已挂载](docs/images/plugin-enabled.png)

看到绿色 **已启用**，并且详情中显示 **Cordis 状态：已挂载**，就说明 Harness 已经加载插件。这里的 `include:timeline-studio` 是当前预览配置中的挂载标识；玩家不需要手动调用它，正常在会话中提出剪辑任务即可。

可以从这句话开始：

> 检查工作区里的 Timeline Studio 工程，告诉我时长、画幅、轨道和素材情况。先不要修改文件。

继续体验安全编辑与导出：

> 把工程改成 9:16。先展示修改预演，确认没有错误后保存为新工程，再渲染一份 MP4；不要覆盖原文件。

![玩家可使用的三类能力：理解工程、安全编辑、交付结果](docs/images/capabilities.svg)

> [!NOTE]
> 插件本身没有单独的可视化面板。它的效果会显示在 Harness 会话的工具调用与结果中，并最终落到新的 `.timeline` 工程和视频文件中。复杂的 WebGPU AI 生成和完整视觉预览仍在 Timeline Studio 编辑器内完成。

## 面向开发者：包含能力

- 7 个模型工具：检查工程、轨道、片段和字幕；语义差异预演；事务式应用编辑；验证 MP4 渲染结果。
- 使用 revision 与幂等 operation ID，避免过期写入和重复执行。
- 通过 `allowedRoots` 实施真实文件访问边界，并阻止输入、输出路径通过符号链接逃逸。
- 将 Harness 的取消信号传递给 Timeline Studio 子进程。
- 在 `.dsh/skills` 中携带完整 `edit-timeline-studio` Skill。
- 单元测试，以及经过真实 DeepSeek Harness/Cordis 工具流水线的端到端测试。

WebGPU AI 生成和复杂浏览器渲染仍由 Timeline Studio 编辑器负责。遇到尚未支持的操作时，插件会明确返回工具错误，不会静默丢失效果。

## 环境要求

- DeepSeek Harness `0.1.0-rc.6` Developer Preview
- Node.js `22.20+` 或 `24+`
- 已安装依赖的本地 Timeline Studio 仓库
- 用于媒体导入和渲染的 FFmpeg 与 ffprobe

## 快速开始

推荐直接把 GitHub 仓库安装为 DSH Web profile 的 Bundle：

```sh
dsh plugin --profile web add "github:MartinDelophy/dsh-timeline-studio-plugin#main"
```

启动 Harness 时提供 Timeline Studio 和工程工作区的绝对路径：

```sh
TIMELINE_STUDIO_ROOT=/绝对路径/web_player \
TIMELINE_PROJECTS_ROOT=/绝对路径/projects \
dsh --profile web
```

Bundle 在未设置 `TIMELINE_STUDIO_ROOT` 时保持禁用，避免尚未配置的安装影响现有 Harness profile。设置环境变量并重新启动后，可以在 **设置 → 插件 → 插件列表** 中确认它已经启用并挂载。

本地插件开发也可以使用 npm link：

```sh
cd /绝对路径/dsh-timeline-studio-plugin
npm install
npm link

cd /绝对路径/deepseek-harness
npm link dsh-timeline-studio-plugin
```

如果不使用 Bundle 安装，也可以手动在 Harness preset 使用的 Cordis 组合中加入插件：

```yaml
- name: 'dsh-timeline-studio-plugin'
  config:
    timelineStudioRoot: /绝对路径/web_player
    allowedRoots:
      - /绝对路径/projects
```

`allowedRoots` 是强制执行的安全边界，不是提示词约定。所有工程、计划、导入素材和输出文件都必须解析到这些目录中。

环境变量形式的配置示例位于 [`config/timeline-studio.cordis.yml`](config/timeline-studio.cordis.yml)。

## 智能体推荐流程

1. 加载 `edit-timeline-studio`。
2. 调用 `timeline_studio_project_inspect`。
3. 在允许目录中写入带版本号的编辑计划。
4. 调用 `timeline_studio_project_diff` 进行语义预演。
5. 只有 diff 成功后，才调用 `timeline_studio_project_apply`。
6. 重新检查输出工程，并按需调用 `timeline_studio_project_render`。

## 文档

- [Timeline Studio 主仓库与完整编辑器](https://github.com/MartinDelophy/ai-video-editor)
- [安装与接入](docs/integration.zh-CN.md) · [Installation and integration](docs/integration.md)
- [工具参考](docs/tools.zh-CN.md) · [Tool reference](docs/tools.md)
- [测试与验证结果](docs/testing.zh-CN.md) · [Testing and verified results](docs/testing.md)

## 开发与验证

```sh
npm run check
TIMELINE_STUDIO_ROOT=/绝对路径/web_player npm run test:e2e
```

DeepSeek Harness 仍处于 Developer Preview，后续可能发生破坏性兼容变更。本项目锁定已经验证的 rc.6 依赖，并将编辑业务逻辑留在 Timeline Studio 中，使 Harness 适配层保持轻薄。

## 深度合成责任使用声明

仅可使用本人拥有或已获得明确授权的人脸与身份素材。禁止制作违法、侵权、虚假、误导性内容，禁止滥用他人身份，也不得把生成结果冒充真实影像。违反这些要求的用户须自行承担全部责任及后果。
