import React, { memo } from 'react';
import '../styles/WaterInkTheme.css';

/**
 * 状态栏组件 - 水墨画风格
 * 显示玩家的修为、灵力和因果值，以及成就、背包和修炼按钮
 */
const StatusBar = memo(({ playerState, onShowAchievements, onShowInventory, onShowCultivation }) => {
  // 添加安全检查，确保playerState存在
  if (!playerState) {
    console.log('警告: playerState未定义，使用默认值');
    return <div className="ink-status-bar loading">加载中...</div>;
  }
  
  return (
    <div className="ink-status-bar">
      <div className="ink-status-item">
        <div className="ink-status-label">修为</div>
        <div className="ink-status-value">{playerState?.attributes?.修为 ?? playerState?.修为 ?? 0}</div>
      </div>
      
      <div className="ink-status-item">
        <div className="ink-status-label">灵力</div>
        <div className="ink-status-value">{playerState?.attributes?.灵力 ?? playerState?.灵力 ?? 0}</div>
      </div>
      
      <div className="ink-status-item">
        <div className="ink-status-label">因果值</div>
        <div className="ink-status-value">{playerState?.attributes?.因果值 ?? playerState?.因果值 ?? 0}</div>
      </div>
      
      <div className="ink-status-buttons">
        <button 
          className="ink-button" 
          onClick={onShowAchievements}
          aria-label="成就"
        >
          <span className="ink-icon">🏆</span>
        </button>
        
        <button 
          className="ink-button" 
          onClick={onShowInventory}
          aria-label="背包"
        >
          <span className="ink-icon">🎒</span>
        </button>
        
        <button 
          className="ink-button" 
          onClick={onShowCultivation}
          aria-label="修炼"
        >
          <span className="ink-icon">⚡</span>
        </button>
      </div>
    </div>
  );
});

export default StatusBar;
