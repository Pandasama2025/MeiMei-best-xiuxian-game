import React, { useState, useEffect } from 'react';
import StoryDisplay from './components/StoryDisplay';
import Options from './components/Options';
import { PlayerProvider, usePlayerState } from './store/playerState';
import storyData from './data/story.json';
import './App.css';

// 游戏主组件
const Game = () => {
  const { playerState, updatePlayerState, updateCurrentChapter } = usePlayerState();
  const [transitionActive, setTransitionActive] = useState(false);
  
  // 加载当前章节
  const currentChapter = storyData.chapters.find(
    chapter => chapter.id === playerState.currentChapterId
  );
  
  // 处理选项选择
  const handleOptionSelect = (option) => {
    // 添加过渡动画
    setTransitionActive(true);
    
    // 更新状态
    if (option.effects) {
      updatePlayerState(option.effects);
    }
    
    // 延迟加载下一个章节，以便显示过渡动画
    setTimeout(() => {
      // 更新章节
      updateCurrentChapter(option.nextId);
      
      // 章节加载后关闭过渡动画
      setTimeout(() => {
        setTransitionActive(false);
      }, 300);
    }, 500);
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
