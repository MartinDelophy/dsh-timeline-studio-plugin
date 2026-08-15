# 工具参考

[English](tools.md) | 简体中文

所有路径参数都必须是绝对路径，并且解析后必须位于 `allowedRoots` 内。工具失败会通过 Harness 流水线返回，并正确标记 `isError: true`。

| 工具 | 参数 | 返回内容 |
|---|---|---|
| `timeline_studio_project_inspect` | `project` | revision、时长、画幅、轨道数量、媒体清单、operation ID 和警告。 |
| `timeline_studio_track_inspect` | `project`、`track` | 指定轨道中按时间排序的片段摘要。 |
| `timeline_studio_clip_inspect` | `project`、`clipId` | 片段源映射、时间、关联、变换和序列化属性。 |
| `timeline_studio_transcript_inspect` | `project`、可选 `audioClipId` | 字幕片段、词级信息、说话人、时间和音频关联。 |
| `timeline_studio_project_diff` | `plan` | 使用真实命令注册表进行语义预演，绝不写入输出工程。 |
| `timeline_studio_project_apply` | `plan` | 完成 revision 和 operation 校验后，事务式写入工程。 |
| `timeline_studio_project_render` | `request` | 为支持的便携子集生成并验证 H.264/AAC MP4。 |

## 编辑计划

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

必须先调用 `timeline_studio_project_diff`，成功后才能调用 `timeline_studio_project_apply`。非空批次成功后 revision 只增加一次；重复 operation ID 会成为空操作；旧 revision 携带新操作时会失败。

## 渲染请求

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

渲染器会验证最终容器、尺寸、时长和音轨状态。遇到不支持的可见特性时会明确拒绝，不会静默丢弃。
