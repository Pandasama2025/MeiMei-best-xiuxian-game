// src/components/StoryDisplay.js
import React, { useState, useEffect } from 'react';
import '../styles/WaterInkTheme.css';

const StoryDisplay = ({ chapter }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState([]);
  const CHARS_PER_PAGE = 500; // 每页大约500个字符
  
  useEffect(() => {
    if (chapter && chapter.text) {
      // 如果有详细文本，将其与主文本合并
      let fullText = chapter.text;
      if (chapter.detailedText && Array.isArray(chapter.detailedText)) {
        fullText += '\n\n' + chapter.detailedText.join('\n\n');
      }
      
      // 将文本分页
      const textLength = fullText.length;
      const pageCount = Math.ceil(textLength / CHARS_PER_PAGE);
      const pagesArray = [];
      
      for (let i = 0; i < pageCount; i++) {
        const start = i * CHARS_PER_PAGE;
        const end = Math.min(start + CHARS_PER_PAGE, textLength);
        pagesArray.push(fullText.substring(start, end));
      }
      
      setPages(pagesArray);
      setCurrentPage(0); // 重置到第一页
    }
  }, [chapter]);
  
  if (!chapter) return <div className="ink-container">正在加载仙侠世界...</div>;
  
  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  return (
    <div className="ink-container">
      <h2 className="ink-title">{chapter.title}</h2>
      
      <div className="ink-scroll-area">
        <p className="ink-text">
          {pages[currentPage] || chapter.text}
        </p>
      </div>
      
      {pages.length > 1 && (
        <div className="ink-pagination">
          <button 
            className="ink-button" 
            onClick={handlePrevPage} 
            disabled={currentPage === 0}
          >
            上一页
          </button>
          <span className="ink-page-indicator">
            {currentPage + 1} / {pages.length}
          </span>
          <button 
            className="ink-button" 
            onClick={handleNextPage} 
            disabled={currentPage === pages.length - 1}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};

export default StoryDisplay;
