// src/components/SceneEffects.js
import React, { useEffect, useRef } from 'react';
import '../styles/SceneEffects.css';

const SceneEffects = ({ assets }) => {
  const audioRef = useRef(null);
  const effectRef = useRef(null);
  
  useEffect(() => {
    if (!assets) return;
    
    // 处理背景音乐
    if (assets.bgm) {
      const bgmInfo = parseBgmInfo(assets.bgm);
      if (audioRef.current) {
        audioRef.current.src = `/assets/audio/${bgmInfo.file}`;
        audioRef.current.volume = bgmInfo.volume / 100;
        audioRef.current.play().catch(error => {
          console.error('播放音乐失败:', error);
        });
      }
    }
    
    // 处理视觉效果
    if (assets.effect) {
      const effectInfo = parseEffectInfo(assets.effect);
      if (effectRef.current) {
        applyVisualEffect(effectRef.current, effectInfo);
      }
    }
    
    // 保存当前ref值以在清理函数中使用
    const currentAudioRef = audioRef.current;
    const currentEffectRef = effectRef.current;
    
    // 清理函数
    return () => {
      if (currentAudioRef) {
        currentAudioRef.pause();
        currentAudioRef.src = '';
      }
      if (currentEffectRef) {
        currentEffectRef.className = 'scene-effects';
      }
    };
  }, [assets]);
  
  /**
   * 解析背景音乐信息
   * @param {string} bgmString - 背景音乐描述字符串
   * @returns {Object} 音乐信息对象
   */
  const parseBgmInfo = (bgmString) => {
    const info = {
      file: '',
      volume: 100
    };
    
    // 解析文件名
    const nameMatch = bgmString.match(/"([^"]+)"/);
    if (nameMatch) {
      info.file = nameMatch[1] + '.mp3';
    }
    
    // 解析音量
    const volumeMatch = bgmString.match(/音量(\d+)%/);
    if (volumeMatch) {
      info.volume = parseInt(volumeMatch[1]);
    }
    
    return info;
  };
  
  /**
   * 解析视觉效果信息
   * @param {string} effectString - 效果描述字符串
   * @returns {Object} 效果信息对象
   */
  const parseEffectInfo = (effectString) => {
    const info = {
      name: '',
      color: '',
      duration: 0,
      type: ''
    };
    
    // 解析效果名称和颜色
    const nameMatch = effectString.match(/([^（]+)（([^）]+)）/);
    if (nameMatch) {
      info.name = nameMatch[1];
      const params = nameMatch[2].split('，');
      
      params.forEach(param => {
        if (param.includes('粒子')) {
          info.type = 'particle';
          info.color = param.replace('粒子', '').trim();
        } else if (param.includes('特效')) {
          info.type = 'effect';
        } else if (param.includes('持续')) {
          const durationMatch = param.match(/持续(\d+)秒/);
          if (durationMatch) {
            info.duration = parseInt(durationMatch[1]) * 1000;
          }
        }
      });
    }
    
    return info;
  };
  
  /**
   * 应用视觉效果
   * @param {HTMLElement} element - 效果容器元素
   * @param {Object} effectInfo - 效果信息对象
   */
  const applyVisualEffect = (element, effectInfo) => {
    // 移除旧的效果类
    element.className = 'scene-effects';
    
    // 添加新的效果类
    if (effectInfo.type === 'particle') {
      element.className += ' particle-effect';
      element.style.setProperty('--particle-color', effectInfo.color);
    } else {
      element.className += ` ${effectInfo.name}-effect`;
    }
    
    // 如果有持续时间，设置定时器移除效果
    if (effectInfo.duration > 0) {
      setTimeout(() => {
        element.className = 'scene-effects';
      }, effectInfo.duration);
    }
  };
  
  return (
    <div className="scene-effects-container">
      <audio ref={audioRef} loop />
      <div ref={effectRef} className="scene-effects" />
    </div>
  );
};

export default SceneEffects;
