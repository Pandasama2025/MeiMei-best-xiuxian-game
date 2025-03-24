// src/components/StoryDisplay.js
import React from 'react';

const StoryDisplay = ({ chapter }) => {
  if (!chapter) return <div className="loading">正在加载仙侠世界...</div>;
  
  return (
    <div className="story-display">
      <h2>{chapter.title}</h2>
      <div className="story-text">
        <p>{chapter.text}</p>
        {chapter.detailedText && (
          <div className="detailed-text">
            {chapter.detailedText.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryDisplay;
