/**
 * u751fu6210u97f3u9891u6587u4ef6u7684u811au672c
 * u8fd9u4e2au811au672cu4f7fu7528 Web Audio API u751fu6210u7b80u5355u7684u97f3u9891u6587u4ef6
 * u8fd0u884cu65b9u5f0f: node generate-audio.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// u786eu4fddu76eeu5f55u5b58u5728
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`u521bu5efau76eeu5f55: ${dirPath}`);
  }
};

// u4f7fu7528 ffmpeg u751fu6210u7b80u5355u7684u97f3u9891u6587u4ef6
// u6ce8u610f: u9700u8981u5b89u88c5 ffmpeg
const generateAudio = (outputPath, options) => {
  const { duration, frequency, type, volume } = {
    duration: 2, // u9ed8u8ba4u65f6u957fu4e3a 2 u79d2
    frequency: 440, // u9ed8u8ba4u9891u7387u4e3a 440Hz (A4)
    type: 'sine', // u9ed8u8ba4u6ce2u5f62u4e3au6b63u5f26u6ce2
    volume: 0.5, // u9ed8u8ba4u97f3u91cfu4e3a 0.5
    ...options
  };

  // u751fu6210 ffmpeg u547du4ee4
  const command = `ffmpeg -f lavfi -i "sine=frequency=${frequency}:duration=${duration}" -af "volume=${volume}" "${outputPath}" -y`;
  
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`u751fu6210u97f3u9891u5931u8d25: ${outputPath}`);
        console.error(error);
        reject(error);
        return;
      }
      console.log(`u751fu6210u97f3u9891u6210u529f: ${outputPath}`);
      resolve();
    });
  });
};

// u4e3bu51fdu6570
async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  const audioDir = path.join(publicDir, 'audio');
  const bgmDir = path.join(audioDir, 'bgm');
  const sfxDir = path.join(audioDir, 'sfx');

  // u786eu4fddu76eeu5f55u5b58u5728
  ensureDir(audioDir);
  ensureDir(bgmDir);
  ensureDir(sfxDir);

  try {
    // u751fu6210u80ccu666fu97f3u4e50
    console.log('u5f00u59cbu751fu6210u80ccu666fu97f3u4e50...');
    await generateAudio(path.join(bgmDir, 'main_theme.mp3'), { duration: 10, frequency: 440, volume: 0.3 });
    await generateAudio(path.join(bgmDir, 'battle_theme.mp3'), { duration: 8, frequency: 520, volume: 0.4 });
    await generateAudio(path.join(bgmDir, 'peaceful_theme.mp3'), { duration: 12, frequency: 380, volume: 0.25 });
    await generateAudio(path.join(bgmDir, 'mystery_theme.mp3'), { duration: 15, frequency: 320, volume: 0.35 });

    // u751fu6210u97f3u6548
    console.log('u5f00u59cbu751fu6210u97f3u6548...');
    await generateAudio(path.join(sfxDir, 'click.mp3'), { duration: 0.2, frequency: 800, volume: 0.4 });
    await generateAudio(path.join(sfxDir, 'success.mp3'), { duration: 1, frequency: 600, volume: 0.5 });
    await generateAudio(path.join(sfxDir, 'failure.mp3'), { duration: 1, frequency: 200, volume: 0.5 });
    await generateAudio(path.join(sfxDir, 'battle_start.mp3'), { duration: 2, frequency: 350, volume: 0.6 });
    await generateAudio(path.join(sfxDir, 'level_up.mp3'), { duration: 3, frequency: 700, volume: 0.5 });
    await generateAudio(path.join(sfxDir, 'skill.mp3'), { duration: 0.5, frequency: 550, volume: 0.45 });
    await generateAudio(path.join(sfxDir, 'heal.mp3'), { duration: 1.5, frequency: 480, volume: 0.4 });

    console.log('u6240u6709u97f3u9891u6587u4ef6u751fu6210u5b8cu6210!');
  } catch (error) {
    console.error('u751fu6210u97f3u9891u6587u4ef6u65f6u51fau9519:', error);
  }
}

// u8fd0u884cu4e3bu51fdu6570
main();
