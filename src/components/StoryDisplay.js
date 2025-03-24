// src/components/StoryDisplay.js
import React from 'react';

const StoryDisplay = ({ chapter }) => {
  if (!chapter) return <div>加载中...</div>;
  
  return (
    <div className="story-display">
      <h2>{chapter.title}</h2>
      <p>{chapter.text}</p>
    </div>
  );
};

export default StoryDisplay;
