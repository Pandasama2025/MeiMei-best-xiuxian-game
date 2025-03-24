import React, { useState, useEffect } from 'react';
import StoryDisplay from './components/StoryDisplay';
import Options from './components/Options';
import storyData from './data/story.json';
import './App.css';

function App() {
  const [currentChapter, setCurrentChapter] = useState(null);
  
  useEffect(() => {
    // 初始化时加载第一个章节
    setCurrentChapter(storyData.chapters[0]);
  }, []);

  const handleOptionSelect = (option) => {
    // 找到下一个章节并设置为当前章节
    const nextChapter = storyData.chapters.find(chapter => chapter.id === option.nextId);
    if (nextChapter) {
      setCurrentChapter(nextChapter);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>仙侠文字RPG</h1>
      </header>
      <main>
        <StoryDisplay chapter={currentChapter} />
        {currentChapter && <Options options={currentChapter.options} onSelect={handleOptionSelect} />}
      </main>
    </div>
  );
}

export default App;
