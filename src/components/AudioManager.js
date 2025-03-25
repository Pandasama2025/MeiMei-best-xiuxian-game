import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import '../styles/AudioManager.css';

// 创建音频上下文
const AudioContext = createContext();

// 用户交互状态
let userInteracted = false;

// 音频初始化状态
let audioInitializationAttempted = false;

// 待播放的音频队列
const pendingAudio = {
  bgm: null,
  sfx: []
};

// 音频加载状态
const audioLoadStatus = {
  bgm: {},
  sfx: {}
};

// 设置音频文件大小阈值（1KB）
const PLACEHOLDER_FILE_SIZE_THRESHOLD = 1000;

// 检查音频文件大小
const checkAudioFileSize = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('HEAD', url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const contentLength = xhr.getResponseHeader('Content-Length');
          resolve(parseInt(contentLength || '0', 10));
        } else {
          reject(new Error(`无法获取文件大小: ${xhr.status}`));
        }
      }
    };
    xhr.onerror = () => reject(new Error('网络错误'));
    xhr.send(null);
  });
};

// 设置用户交互监听器 - 使用多种事件确保捕获用户交互
const setupUserInteractionListeners = () => {
  if (audioInitializationAttempted) return;
  
  console.log('设置音频交互监听器...');
  audioInitializationAttempted = true;
  
  const handleUserInteraction = () => {
    if (userInteracted) return;
    
    userInteracted = true;
    console.log('用户已交互，音频现在可以播放');
    
    // 尝试播放所有暂停的背景音乐
    document.querySelectorAll('audio[data-type="bgm"]').forEach(audio => {
      if (audio.paused && audio.dataset.shouldPlay === 'true') {
        audio.play().catch(err => console.warn('尝试自动播放音频失败:', err));
      }
    });
    
    // 播放队列中的音频
    if (pendingAudio.bgm) {
      const { name, audio } = pendingAudio.bgm;
      console.log(`播放队列中的背景音乐: ${name}`);
      audio.play().catch(err => console.warn(`播放队列中的背景音乐失败: ${name}`, err));
      pendingAudio.bgm = null;
    }
    
    if (pendingAudio.sfx.length > 0) {
      pendingAudio.sfx.forEach(({ name, audio }) => {
        console.log(`播放队列中的音效: ${name}`);
        audio.play().catch(err => console.warn(`播放队列中的音效失败: ${name}`, err));
      });
      pendingAudio.sfx = [];
    }
    
    // 移除所有事件监听器
    ['click', 'touchstart', 'keydown', 'scroll'].forEach(eventType => {
      document.removeEventListener(eventType, handleUserInteraction);
    });
  };
  
  // 添加多种事件监听器以确保捕获用户交互
  ['click', 'touchstart', 'keydown', 'scroll'].forEach(eventType => {
    document.addEventListener(eventType, handleUserInteraction, { passive: true });
  });
  
  // 检查用户是否已经交互过（例如，如果页面刷新但会话仍然活跃）
  if (localStorage.getItem('userInteracted') === 'true') {
    handleUserInteraction();
  }
};

// 初始化用户交互监听器
setupUserInteractionListeners();

/**
 * 音频管理器组件
 * 提供背景音乐和音效的播放控制
 */
export const AudioProvider = ({ children }) => {
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [currentBgm, setCurrentBgm] = useState(null);
  const [bgmVolume, setBgmVolume] = useState(0.3);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [audioElements, setAudioElements] = useState({});
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [audioLoadErrors, setAudioLoadErrors] = useState([]);

  // 初始化音频元素
  useEffect(() => {
    try {
      console.log('初始化音频元素...');
      
      // 预加载背景音乐
      const bgmElements = {
        'main': new Audio('/audio/bgm/main_theme.mp3'),
        'battle': new Audio('/audio/bgm/battle_theme.mp3'),
        'peaceful': new Audio('/audio/bgm/peaceful_theme.mp3'),
        'mystery': new Audio('/audio/bgm/mystery_theme.mp3'),
      };
      
      // 预加载音效
      const sfxElements = {
        'click': new Audio('/audio/sfx/click.mp3'),
        'success': new Audio('/audio/sfx/success.mp3'),
        'failure': new Audio('/audio/sfx/failure.mp3'),
        'battle_start': new Audio('/audio/sfx/battle_start.mp3'),
        'level_up': new Audio('/audio/sfx/level_up.mp3'),
        'skill': new Audio('/audio/sfx/skill.mp3'),
        'heal': new Audio('/audio/sfx/heal.mp3'),
      };
      
      // 设置所有音频元素的循环和音量
      Object.entries(bgmElements).forEach(([name, audio]) => {
        audio.loop = true;
        audio.volume = bgmVolume;
        audio.dataset.type = 'bgm';
        audio.dataset.shouldPlay = 'false';
        audio.dataset.name = name;
        
        // 检查音频文件大小
        const url = audio.src;
        const loadPromise = checkAudioFileSize(url)
          .then(size => {
            if (size < PLACEHOLDER_FILE_SIZE_THRESHOLD) {
              console.warn(`背景音乐文件过小: ${name} (大小: ${size} 字节)`);
              audioLoadStatus.bgm[name] = {
                loaded: false,
                error: '文件过小',
                size
              };
              return false;
            }
            audioLoadStatus.bgm[name] = { loaded: true, size };
            return true;
          })
          .catch(error => {
            console.error(`无法获取背景音乐文件大小: ${name}`, error);
            audioLoadStatus.bgm[name] = { loaded: false, error: error.message };
            return false;
          });
        
        // 添加错误处理
        audio.onerror = (e) => {
          console.error(`背景音乐加载失败: ${name}`, e);
          audioLoadStatus.bgm[name] = { loaded: false, error: '加载失败' };
        };
      });
      
      Object.entries(sfxElements).forEach(([name, audio]) => {
        audio.loop = false;
        audio.volume = sfxVolume;
        audio.dataset.type = 'sfx';
        audio.dataset.name = name;
        
        // 检查音频文件大小
        const url = audio.src;
        const loadPromise = checkAudioFileSize(url)
          .then(size => {
            if (size < PLACEHOLDER_FILE_SIZE_THRESHOLD) {
              console.warn(`音效文件过小: ${name} (大小: ${size} 字节)`);
              audioLoadStatus.sfx[name] = {
                loaded: false,
                error: '文件过小',
                size
              };
              return false;
            }
            audioLoadStatus.sfx[name] = { loaded: true, size };
            return true;
          })
          .catch(error => {
            console.error(`无法获取音效文件大小: ${name}`, error);
            audioLoadStatus.sfx[name] = { loaded: false, error: error.message };
            return false;
          });
        
        // 添加错误处理
        audio.onerror = (e) => {
          console.error(`音效加载失败: ${name}`, e);
          audioLoadStatus.sfx[name] = { loaded: false, error: '加载失败' };
        };
      });
      
      setAudioElements({
        bgm: bgmElements,
        sfx: sfxElements
      });
      
      setAudioInitialized(true);
      console.log('音频元素初始化完成');
      
      // 检查用户是否需要交互提示
      if (!userInteracted) {
        setShowAudioPrompt(true);
        console.log('显示音频交互提示');
      }
      
      // 确保用户交互监听器已设置
      setupUserInteractionListeners();
    } catch (error) {
      console.error('初始化音频元素失败:', error);
    }
    
    // 清理函数
    return () => {
      try {
        // 停止所有音频
        if (audioElements.bgm) {
          Object.values(audioElements.bgm).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
          });
        }
        
        if (audioElements.sfx) {
          Object.values(audioElements.sfx).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
          });
        }
      } catch (error) {
        console.error('清理音频元素失败:', error);
      }
    };
  }, []);

  // 播放背景音乐
  const playBgm = useCallback((name) => {
    if (!bgmEnabled || !audioElements.bgm || !audioElements.bgm[name]) {
      console.warn(`无法播放背景音乐: ${name} (已禁用或未找到)`);
      return;
    }
    
    // 检查音频文件是否可用
    if (audioLoadStatus.bgm[name] && !audioLoadStatus.bgm[name].loaded) {
      console.warn(`无法播放背景音乐: ${name} (文件过小或加载失败)`);
      return;
    }
    
    try {
      // 停止当前播放的背景音乐
      if (currentBgm && audioElements.bgm[currentBgm]) {
        audioElements.bgm[currentBgm].pause();
        audioElements.bgm[currentBgm].currentTime = 0;
        audioElements.bgm[currentBgm].dataset.shouldPlay = 'false';
      }
      
      // 播放新的背景音乐
      const audio = audioElements.bgm[name];
      audio.volume = bgmVolume;
      audio.dataset.shouldPlay = 'true';
      
      // 只有在用户已交互的情况下才播放
      if (userInteracted) {
        audio.play().catch(error => {
          console.warn(`播放背景音乐失败: ${name}`, error);
          // 显示音频交互提示
          setShowAudioPrompt(true);
        });
      } else {
        console.log(`等待用户交互后播放背景音乐: ${name}`);
        // 将音频添加到待播放队列
        pendingAudio.bgm = { name, audio };
        // 显示音频交互提示
        setShowAudioPrompt(true);
        // 记录用户交互状态
        localStorage.setItem('userInteracted', 'false');
      }
      
      setCurrentBgm(name);
    } catch (error) {
      console.error(`播放背景音乐出错: ${name}`, error);
    }
  }, [bgmEnabled, audioElements, currentBgm, bgmVolume]);

  // 播放音效
  const playSfx = useCallback((name) => {
    if (!sfxEnabled || !audioElements.sfx || !audioElements.sfx[name]) {
      console.warn(`无法播放音效: ${name} (已禁用或未找到)`);
      return;
    }
    
    // 检查音频文件是否可用
    if (audioLoadStatus.sfx[name] && !audioLoadStatus.sfx[name].loaded) {
      console.warn(`无法播放音效: ${name} (文件过小或加载失败)`);
      return;
    }
    
    try {
      // 只有在用户已交互的情况下才播放
      if (userInteracted) {
        const audio = audioElements.sfx[name];
        audio.volume = sfxVolume;
        audio.currentTime = 0;
        audio.play().catch(error => {
          console.warn(`播放音效失败: ${name}`, error);
        });
      } else {
        console.log(`等待用户交互后播放音效: ${name}`);
        // 将音效添加到待播放队列
        const audio = audioElements.sfx[name];
        audio.volume = sfxVolume;
        audio.currentTime = 0;
        pendingAudio.sfx.push({ name, audio });
      }
    } catch (error) {
      console.error(`播放音效出错: ${name}`, error);
    }
  }, [sfxEnabled, audioElements, sfxVolume]);

  // 切换背景音乐开关
  const toggleBgm = useCallback(() => {
    setBgmEnabled(prev => {
      const newState = !prev;
      
      try {
        // 如果关闭，暂停当前背景音乐
        if (!newState && currentBgm && audioElements.bgm && audioElements.bgm[currentBgm]) {
          audioElements.bgm[currentBgm].pause();
          audioElements.bgm[currentBgm].dataset.shouldPlay = 'false';
        }
        
        // 如果开启，播放当前背景音乐
        if (newState && currentBgm && audioElements.bgm && audioElements.bgm[currentBgm]) {
          const audio = audioElements.bgm[currentBgm];
          audio.dataset.shouldPlay = 'true';
          
          if (userInteracted) {
            audio.play().catch(error => {
              console.warn(`重新播放背景音乐失败: ${currentBgm}`, error);
              setShowAudioPrompt(true);
            });
          } else {
            pendingAudio.bgm = { name: currentBgm, audio };
            setShowAudioPrompt(true);
          }
        }
      } catch (error) {
        console.error('切换背景音乐开关出错', error);
      }
      
      return newState;
    });
  }, [audioElements, currentBgm]);

  // 切换音效开关
  const toggleSfx = useCallback(() => {
    setSfxEnabled(prev => !prev);
  }, []);

  // 设置背景音乐音量
  const setBgmVolumeValue = useCallback((value) => {
    setBgmVolume(value);
    
    try {
      // 更新所有背景音乐的音量
      if (audioElements.bgm) {
        Object.values(audioElements.bgm).forEach(audio => {
          audio.volume = value;
        });
      }
    } catch (error) {
      console.error('设置背景音乐音量出错', error);
    }
  }, [audioElements]);

  // 设置音效音量
  const setSfxVolumeValue = useCallback((value) => {
    setSfxVolume(value);
    
    try {
      // 更新所有音效的音量
      if (audioElements.sfx) {
        Object.values(audioElements.sfx).forEach(audio => {
          audio.volume = value;
        });
      }
    } catch (error) {
      console.error('设置音效音量出错', error);
    }
  }, [audioElements]);

  // 关闭音频交互提示
  const closeAudioPrompt = useCallback(() => {
    setShowAudioPrompt(false);
  }, []);

  // 处理用户交互提示点击
  const handleAudioPromptClick = useCallback(() => {
    // 标记用户已交互
    userInteracted = true;
    localStorage.setItem('userInteracted', 'true');
    setShowAudioPrompt(false);
    
    // 尝试播放当前背景音乐
    if (currentBgm && audioElements.bgm && audioElements.bgm[currentBgm]) {
      const audio = audioElements.bgm[currentBgm];
      audio.play().catch(error => {
        console.warn(`用户交互后播放背景音乐失败: ${currentBgm}`, error);
      });
    }
    
    // 播放队列中的音频
    if (pendingAudio.bgm) {
      const { name, audio } = pendingAudio.bgm;
      console.log(`播放队列中的背景音乐: ${name}`);
      audio.play().catch(err => console.warn(`播放队列中的背景音乐失败: ${name}`, err));
      pendingAudio.bgm = null;
    }
    
    if (pendingAudio.sfx.length > 0) {
      pendingAudio.sfx.forEach(({ name, audio }) => {
        console.log(`播放队列中的音效: ${name}`);
        audio.play().catch(err => console.warn(`播放队列中的音效失败: ${name}`, err));
      });
      pendingAudio.sfx = [];
    }
  }, [audioElements, currentBgm]);

  return (
    <AudioContext.Provider value={{
      playBgm,
      playSfx,
      toggleBgm,
      toggleSfx,
      setBgmVolume: setBgmVolumeValue,
      setSfxVolume: setSfxVolumeValue,
      bgmEnabled,
      sfxEnabled,
      bgmVolume,
      sfxVolume,
      currentBgm,
      audioInitialized,
      audioLoadErrors
    }}>
      {children}
      
      {/* 音频控制组件 */}
      <AudioControls 
        bgmEnabled={bgmEnabled} 
        sfxEnabled={sfxEnabled} 
        toggleBgm={toggleBgm} 
        toggleSfx={toggleSfx}
        bgmVolume={bgmVolume}
        sfxVolume={sfxVolume}
        setBgmVolume={setBgmVolume}
        setSfxVolume={setSfxVolume}
        audioInitialized={audioInitialized}
        audioLoadErrors={audioLoadErrors}
      />
      
      {/* 音频交互提示 */}
      {showAudioPrompt && (
        <div className="audio-prompt" onClick={handleAudioPromptClick}>
          <div className="audio-prompt-content">
            <h3>点击任意位置启用音频</h3>
            <p>游戏需要您的交互才能播放音频</p>
            {audioLoadErrors.length > 0 && (
              <div className="audio-load-errors">
                <p className="audio-warning">注意: 部分音频文件加载失败或过小</p>
                <p className="audio-warning-detail">您可以在无音频模式下继续游戏</p>
              </div>
            )}
            <button className="ink-button">点击启用</button>
          </div>
        </div>
      )}
    </AudioContext.Provider>
  );
};

/**
 * 音频控制组件
 * 显示在界面右下角，用于控制音频开关
 */
const AudioControls = ({ 
  bgmEnabled, 
  sfxEnabled, 
  toggleBgm, 
  toggleSfx,
  bgmVolume,
  sfxVolume,
  setBgmVolume,
  setSfxVolume,
  audioInitialized,
  audioLoadErrors
}) => {
  // 如果音频未初始化，不显示控制器
  if (!audioInitialized) {
    return null;
  }

  return (
    <div className="audio-controls">
      {audioLoadErrors && audioLoadErrors.length > 0 && (
        <div className="audio-status-warning">
          <span>音频文件加载失败或过小</span>
        </div>
      )}
      <div className="audio-control-row">
        <span className="audio-control-label">背景音乐</span>
        <div 
          className={`audio-toggle ${bgmEnabled ? 'active' : ''}`} 
          onClick={toggleBgm}
        />
        <input 
          type="range" 
          className="volume-slider" 
          min="0" 
          max="1" 
          step="0.1" 
          value={bgmVolume} 
          onChange={(e) => setBgmVolume(parseFloat(e.target.value))} 
          disabled={!bgmEnabled}
        />
      </div>
      <div className="audio-control-row">
        <span className="audio-control-label">音效</span>
        <div 
          className={`audio-toggle ${sfxEnabled ? 'active' : ''}`} 
          onClick={toggleSfx}
        />
        <input 
          type="range" 
          className="volume-slider" 
          min="0" 
          max="1" 
          step="0.1" 
          value={sfxVolume} 
          onChange={(e) => setSfxVolume(parseFloat(e.target.value))} 
          disabled={!sfxEnabled}
        />
      </div>
    </div>
  );
};

/**
 * 自定义Hook，用于在组件中使用音频功能
 */
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio必须在AudioProvider内部使用');
  }
  return context;
};

export default AudioProvider;
