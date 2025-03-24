// src/components/Options.js
import React from 'react';
import '../styles/WaterInkTheme.css';

const Options = ({ options, onSelect }) => {
  if (!options || options.length === 0) return null;
  
  return (
    <div className="ink-container">
      <div className="options-container">
        {options.map((option, index) => (
          <button 
            key={index} 
            className="ink-button"
            onClick={() => onSelect(option)}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Options;
