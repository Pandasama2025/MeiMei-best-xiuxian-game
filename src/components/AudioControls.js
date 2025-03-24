import React, { useState, useEffect } from 'react';
import AudioManager from '../audio/audioManager';

// 音效控制组件
const AudioControls = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isBgMusicPlaying, setIsBgMusicPlaying] = useState(false);

  // 组件挂载时初始化音效系统
  useEffect(() => {
    AudioManager.initSounds();
    // 设置初始音量
    AudioManager.setGlobalVolume(volume);
    
    // 组件卸载时停止所有音效
    return () => {
      AudioManager.soundNames.forEach(name => {
        AudioManager.stop(name);
      });
    };
  }, []);

  // 处理音量变化
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    AudioManager.setGlobalVolume(newVolume);
  };

  // 处理静音/取消静音
  const handleMuteToggle = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    AudioManager.mute(newMuteState);
  };

  // 处理背景音乐播放/暂停
  const handleBgMusicToggle = () => {
    if (isBgMusicPlaying) {
      AudioManager.pause('bgMusic');
    } else {
      AudioManager.play('bgMusic');
    }
    setIsBgMusicPlaying(!isBgMusicPlaying);
  };

  return (
    <div className="audio-controls">
      <button 
        className="audio-button"
        onClick={handleBgMusicToggle}
        title={isBgMusicPlaying ? "暂停背景音乐" : "播放背景音乐"}
      >
        {isBgMusicPlaying ? "🔊" : "🔈"}
      </button>
      
      <button 
        className="audio-button"
        onClick={handleMuteToggle}
        title={isMuted ? "取消静音" : "静音"}
      >
        {isMuted ? "🔇" : "🔊"}
      </button>
      
      <div className="volume-slider">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          disabled={isMuted}
          title={`音量: ${Math.round(volume * 100)}%`}
        />
      </div>
    </div>
  );
};

export default AudioControls;
