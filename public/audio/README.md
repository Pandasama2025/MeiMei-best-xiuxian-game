# 音频文件说明

## 文件结构

音频文件分为两类：

1. 背景音乐 (BGM)：位于 `/audio/bgm/` 目录下
   - `main_theme.mp3` - 主界面背景音乐
   - `battle_theme.mp3` - 战斗场景背景音乐
   - `peaceful_theme.mp3` - 平静场景背景音乐
   - `mystery_theme.mp3` - 神秘场景背景音乐

2. 音效 (SFX)：位于 `/audio/sfx/` 目录下
   - `click.mp3` - 点击音效
   - `success.mp3` - 成功音效
   - `failure.mp3` - 失败音效
   - `battle_start.mp3` - 战斗开始音效
   - `level_up.mp3` - 升级音效
   - `skill.mp3` - 技能使用音效
   - `heal.mp3` - 治疗音效

## 音频文件要求

1. 文件格式：建议使用 MP3 格式，兼容性最好
2. 文件大小：每个文件至少应大于 1KB，否则会被系统视为占位文件而不加载
3. 音频长度：
   - 背景音乐：建议 30 秒以上，会循环播放
   - 音效：建议 3 秒以内，播放一次

## 如何替换音频文件

1. 准备好您的音频文件，确保文件名与上述列表相同
2. 将文件放入相应目录（bgm 或 sfx）
3. 刷新游戏页面，新的音频文件将被自动加载

## 音频文件生成

如果您暂时没有合适的音频文件，可以使用以下方法生成测试用的音频文件：

1. 使用项目根目录下的 `scripts/generate-audio.js` 脚本（需要安装 Node.js 和 ffmpeg）
   ```
   node scripts/generate-audio.js
   ```

2. 或者使用在线音频生成工具，如 [Bfxr](https://www.bfxr.net/) 或 [ChipTone](https://sfbgames.itch.io/chiptone) 生成音效

## 音频加载问题排查

如果游戏中显示音频加载错误，请检查：

1. 文件是否存在于正确的目录中
2. 文件大小是否大于 1KB（非占位文件）
3. 文件格式是否为浏览器支持的格式（MP3、WAV、OGG 等）
4. 浏览器是否允许音频自动播放（可能需要用户交互才能播放音频）
