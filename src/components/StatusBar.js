import React from 'react';
import { usePlayerState } from '../store/playerState';
import '../styles/WaterInkTheme.css';

/**
 * 状态栏组件 - 水墨画风格
 * 显示玩家的修为、灵力和因果值
 */
const StatusBar = () => {
  const { playerState } = usePlayerState();
  
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
    </div>
  );
};

export default StatusBar;
