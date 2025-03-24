import { Howl, Howler } from 'howler';

// 音效配置
const sounds = {
  // 背景音乐
  bgMusic: {
    src: ['/sounds/bg-music.mp3'],
    volume: 0.5,
    loop: true,
    autoplay: false
  },
  // 点击按钮音效
  buttonClick: {
    src: ['/sounds/button-click.mp3'],
    volume: 0.7,
    loop: false,
    autoplay: false
  },
  // 章节转换音效
  chapterTransition: {
    src: ['/sounds/chapter-transition.mp3'],
    volume: 0.7,
    loop: false,
    autoplay: false
  },
  // 获得修为音效
  gainCultivation: {
    src: ['/sounds/gain-cultivation.mp3'],
    volume: 0.8,
    loop: false,
    autoplay: false
  },
  // 灵力消耗音效
  spendMana: {
    src: ['/sounds/spend-mana.mp3'],
    volume: 0.6,
    loop: false,
    autoplay: false
  }
};

// 音效实例存储
const soundInstances = {};

// 初始化所有音效
const initSounds = () => {
  Object.keys(sounds).forEach(key => {
    soundInstances[key] = new Howl(sounds[key]);
  });
  
  console.log('音效系统初始化完成');
};

// 播放指定音效
const play = (soundName) => {
  if (soundInstances[soundName]) {
    soundInstances[soundName].play();
  } else {
    console.warn(`音效 ${soundName} 不存在`);
  }
};

// 停止指定音效
const stop = (soundName) => {
  if (soundInstances[soundName]) {
    soundInstances[soundName].stop();
  } else {
    console.warn(`音效 ${soundName} 不存在`);
  }
};

// 暂停指定音效
const pause = (soundName) => {
  if (soundInstances[soundName]) {
    soundInstances[soundName].pause();
  } else {
    console.warn(`音效 ${soundName} 不存在`);
  }
};

// 设置音量（0.0 - 1.0）
const setVolume = (soundName, volume) => {
  if (soundInstances[soundName]) {
    soundInstances[soundName].volume(volume);
  } else {
    console.warn(`音效 ${soundName} 不存在`);
  }
};

// 设置全局音量
const setGlobalVolume = (volume) => {
  Howler.volume(volume);
};

// 静音/取消静音
const mute = (isMuted) => {
  Howler.mute(isMuted);
};

// 检查音效是否正在播放
const isPlaying = (soundName) => {
  return soundInstances[soundName] ? soundInstances[soundName].playing() : false;
};

// 导出音效管理器
const AudioManager = {
  initSounds,
  play,
  stop,
  pause,
  setVolume,
  setGlobalVolume,
  mute,
  isPlaying,
  soundNames: Object.keys(sounds)
};

export default AudioManager;
