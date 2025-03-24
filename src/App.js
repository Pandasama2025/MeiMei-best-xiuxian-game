import React, { useState, useEffect } from 'react';
import StoryDisplay from './components/StoryDisplay';
import Options from './components/Options';
import AudioControls from './components/AudioControls';
import StatusBar from './components/StatusBar';
import SaveLoadScreen from './components/SaveLoadScreen';
import { PlayerProvider, usePlayerState } from './store/playerState';
import AudioManager from './audio/audioManager';
import storyData from './data/story.json';
import './App.css';
import './styles/WaterInkTheme.css';

// 游戏主组件
const Game = () => {
  const { playerState, updatePlayerState, updateCurrentChapter, saveGame, loadGame } = usePlayerState();
  const [transitionActive, setTransitionActive] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showSaveLoadScreen, setShowSaveLoadScreen] = useState(false);
  
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
  
  // 处理保存/加载界面显示
  const toggleSaveLoadScreen = () => {
    // 播放按钮点击音效
    AudioManager.play('buttonClick');
    setShowSaveLoadScreen(!showSaveLoadScreen);
  };
  
  // 处理加载游戏
  const handleLoadChapter = (chapter) => {
    // 播放章节转换音效
    AudioManager.play('chapterTransition');
    updateCurrentChapter(chapter.id);
  };
  
  return (
    <div className="game-container">
      <StatusBar />
      
      <div className="game-controls ink-container">
        <button className="ink-button" onClick={toggleSaveLoadScreen}>
          {showSaveLoadScreen ? '返回游戏' : '存档/读档'}
        </button>
        {saveMessage && <span className="save-message">{saveMessage}</span>}
        <AudioControls />
      </div>
      
      {showSaveLoadScreen ? (
        <SaveLoadScreen 
          currentChapter={currentChapter} 
          onClose={toggleSaveLoadScreen}
          onLoad={handleLoadChapter}
        />
      ) : (
        <main className={transitionActive ? 'fade-out' : 'fade-in'}>
          <StoryDisplay chapter={currentChapter} />
          {currentChapter && <Options options={currentChapter.options} onSelect={handleOptionSelect} />}
        </main>
      )}
    </div>
  );
};

// 应用组件
function App() {
  return (
    <div className="App">
      <header className="App-header ink-title">
        <h1>仙侠文字RPG</h1>
      </header>
      <PlayerProvider>
        <Game />
      </PlayerProvider>
      <footer className="ink-container">
        <p> 2025 仙侠文字RPG - 一场修仙之旅</p>
      </footer>
    </div>
  );
}

export default App;
