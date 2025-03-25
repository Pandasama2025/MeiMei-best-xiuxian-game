import React from 'react';
import '../styles/WaterInkTheme.css';

/**
 * 状态栏组件 - 水墨画风格
 * 显示玩家的修为、灵力和因果值，以及成就和背包按钮
 */
const StatusBar = ({ playerState, onShowAchievements, onShowInventory }) => {
  return (
    <div className="ink-status-bar">
      <div className="ink-status-item">
        <div className="ink-status-label">修为</div>
        <div className="ink-status-value">{playerState.修为 || 0}</div>
      </div>
      
      <div className="ink-status-item">
        <div className="ink-status-label">灵力</div>
        <div className="ink-status-value">{playerState.灵力 || 0}</div>
      </div>
      
      <div className="ink-status-item">
        <div className="ink-status-label">因果值</div>
        <div className="ink-status-value">{playerState.因果值 || 0}</div>
      </div>
      
      <div className="ink-status-buttons">
        <button 
          className="ink-button ink-small-button" 
          onClick={onShowAchievements}
          title="查看成就"
        >
          <span className="button-icon">🏆</span>
          <span className="button-text">成就</span>
        </button>
        
        <button 
          className="ink-button ink-small-button" 
          onClick={onShowInventory}
          title="查看背包"
        >
          <span className="button-icon">🧰</span>
          <span className="button-text">背包</span>
        </button>
      </div>
    </div>
  );
};

export default StatusBar;
