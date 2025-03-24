import React, { useState, useEffect } from 'react';
import StoryDisplay from './components/StoryDisplay';
import Options from './components/Options';
import AudioControls from './components/AudioControls';
import { PlayerProvider, usePlayerState } from './store/playerState';
import AudioManager from './audio/audioManager';
import storyData from './data/story.json';
import './App.css';

// 游戏主组件
const Game = () => {
  const { playerState, updatePlayerState, updateCurrentChapter, saveGame, loadGame } = usePlayerState();
  const [transitionActive, setTransitionActive] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // 加载当前章节
  const currentChapter = storyData.chapters.find(
    chapter => chapter.id === playerState.currentChapterId
  );
  
  // 处理选项选择
  const handleOptionSelect = (option) => {
    // 播放按钮点击音效
    AudioManager.play('buttonClick');
    
    // 添加过渡动画
    setTransitionActive(true);
    
    // 更新状态
    if (option.effects) {
      updatePlayerState(option.effects);
      
      // 根据效果播放相应音效
      if (option.effects.修为 && option.effects.修为 > 0) {
        AudioManager.play('gainCultivation');
      }
      
      if (option.effects.灵力 && option.effects.灵力 < 0) {
        AudioManager.play('spendMana');
      }
    }
    
    // 延迟加载下一个章节，以便显示过渡动画
    setTimeout(() => {
      // 更新章节
      updateCurrentChapter(option.nextId);
      
      // 播放章节转换音效
      AudioManager.play('chapterTransition');
      
      // 章节加载后关闭过渡动画
      setTimeout(() => {
        setTransitionActive(false);
      }, 300);
    }, 500);
  };
  
  // 处理保存游戏
  const handleSaveGame = async () => {
    // 播放按钮点击音效
    AudioManager.play('buttonClick');
    
    const saveId = await saveGame();
    if (saveId) {
      setSaveMessage('游戏已保存');
      setTimeout(() => setSaveMessage(''), 3000);
    } else {
      setSaveMessage('保存失败');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };
  
  // 处理加载游戏
  const handleLoadGame = async () => {
    // 播放按钮点击音效
    AudioManager.play('buttonClick');
    
    const success = await loadGame();
    if (success) {
      setSaveMessage('游戏已加载');
      setTimeout(() => setSaveMessage(''), 3000);
    } else {
      setSaveMessage('加载失败');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };
  
  // 显示状态栏
  const StatusBar = () => (
    <div className="status-bar">
      <div>修为: {playerState.修为}</div>
      <div>灵力: {playerState.灵力}</div>
      <div>因果值: {playerState.因果值}</div>
    </div>
  );
  
  return (
    <>
      <StatusBar />
      <div className="game-controls">
        <button onClick={handleSaveGame}>保存游戏</button>
        <button onClick={handleLoadGame}>加载游戏</button>
        {saveMessage && <span className="save-message">{saveMessage}</span>}
        <AudioControls />
      </div>
      <main className={transitionActive ? 'fade-out' : 'fade-in'}>
        <StoryDisplay chapter={currentChapter} />
        {currentChapter && <Options options={currentChapter.options} onSelect={handleOptionSelect} />}
      </main>
    </>
  );
};

// 应用组件
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>仙侠文字RPG</h1>
      </header>
      <PlayerProvider>
        <Game />
      </PlayerProvider>
      <footer>
        <p> 2025 仙侠文字RPG - 一场修仙之旅</p>
      </footer>
    </div>
  );
}

export default App;
