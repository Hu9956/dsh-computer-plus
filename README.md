# 电脑操控 Plus（dsh-computer-plus）

给 DSH 的 Agent 一组 `computer_*` 工具来操控 macOS 应用，并在对话信息面板的「电脑操控」组里实时显示它正在操控的窗口。

- 底层是 [cua-driver](https://cua.ai/docs/cua-driver)：插件调 `cua-driver call <工具> <JSON>`，和在终端里用的是同一个守护进程、同一套权限。只走后台投递，不抢前台、不动你的鼠标。
- 面板只看 Agent 调工具时写明的 `pid` 和 `window_id`，不解析 bash 命令、不猜窗口。Agent 在 bash 里直接调 cua-driver 时面板不显示。
- 截图交给模型时存成附件（和 `read_image` 一样）；面板画面只在内存里留最新一帧，不落盘、不进会话日志，重启即无。

## 工具

| 工具 | 作用 |
| --- | --- |
| `computer_launch_app` | 在后台打开（或找到）应用，返回 pid |
| `computer_list_windows` | 列出窗口的 pid、window_id |
| `computer_get_window_state` | 读一个窗口的界面树（可操作元素编号 [N]）和截图 |
| `computer_click` | 按元素编号或截图像素点击 |
| `computer_type_text` | 输入文字 |
| `computer_press_key` | 按键 / 快捷键 |
| `computer_scroll` | 滚动 |

每个 DSH 对话用一个固定的 cua-driver session（`dsh-` + 对话 id 的哈希），回合结束时插件结束它，下一轮自动重新开始。

## 依赖

- macOS，装好 cua-driver（`~/.local/bin`、`/opt/homebrew/bin` 或 `/usr/local/bin`），并授予辅助功能和屏幕录制权限
- 实时画面要 Xcode 命令行工具（首次用到时用 `swiftc` 编译 `assets/computer-stream.swift`，产物在 `~/Library/Caches/dsh-computer-plus`）
- 面板来自 dsh-harness-plus 的对话信息面板，它声明插槽 `harness.session-info.computer`；没装它时工具照常能用，只是没有画面

## 开发

```bash
npm test          # 单元测试
node run.mjs bundle   # 类型检查 + 打包到 lib/
```
