# 测试与验证结果

[English](testing.md) | 简体中文

## 单元检查

```sh
npm run check
```

单元测试覆盖：命令调用、8 个工具注册、`allowedRoots`、编辑计划内素材与输出路径保护、输出符号链接拒绝，以及把 Timeline Studio 的 `ok:false` 正确转换为 Harness 工具错误。

## 端到端测试

```sh
TIMELINE_STUDIO_ROOT=/绝对路径/web_player npm run test:e2e
```

测试使用真实 Cordis `Context`、`@deepseek-ai/dsh-system-prompt` 和 `@deepseek-ai/dsh-tools` 0.1.1-rc.2 执行流水线，不需要大语言模型或 API Key，并完成以下流程：

1. 挂载生产插件，验证 8 个模型可见工具 schema。
2. 在系统临时目录创建便携 `.timeline` 工程。
3. 检查 revision 0 和原始 16:9 画幅。
4. 使用 FFmpeg 生成真实 PNG。
5. 预演导入 PNG、将画幅改成 9:16 并添加审阅区间的计划，确认 diff 不写文件。
6. 应用编辑计划，重新打开 revision 1 的输出工程。
7. 通过 Harness 工具检查画面轨道、片段、字幕和保存的审阅区间。
8. 通过 Timeline Studio 渲染真实的 180×320 MP4。
9. 使用 ffprobe 解码检查输出，验证时长和尺寸。
10. 尝试读取允许目录外的文件，确认 Harness 返回 `isError: true`。

## 最近一次验证环境

- 日期：2026-11-11
- Node.js：24.11.1
- DeepSeek Harness 工具包：0.1.1-rc.2
- Cordis：4.0.1
- FFmpeg/ffprobe：8.0.1
- 单元测试：8 项通过
- 端到端测试：1 项通过
- DeepSeek Harness 0.2.2-rc.1 Web profile：全新配置安装成功，无 peer 依赖冲突，挂载 8 个工具，并通过宿主执行器读取已保存的标记。

所有生成媒体与工程都写入操作系统临时目录，仓库中不会保留测试媒体。
