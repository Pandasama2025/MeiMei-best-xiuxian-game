import React, { useState, useEffect } from 'react';
import { getAchievementDisplayInfo } from '../utils/achievements';
import '../styles/AchievementsPanel.css';

/**
 * 成就面板组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.isOpen - 面板是否打开
 * @param {Function} props.onClose - 关闭面板的回调函数
 */
const AchievementsPanel = ({ isOpen, onClose }) => {
  const [achievements, setAchievements] = useState([]);
  const [showHidden, setShowHidden] = useState(false);
  const [filter, setFilter] = useState('all');

  // 加载成就
  useEffect(() => {
    if (isOpen) {
      setAchievements(getAchievementDisplayInfo(showHidden));
    }
  }, [isOpen, showHidden]);

  // 如果面板未打开，不渲染内容
  if (!isOpen) return null;

  // 过滤成就
  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });

  // 计算解锁进度
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="achievements-overlay">
      <div className="achievements-panel">
        <div className="achievements-header">
          <h2>成就系统</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="achievements-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {unlockedCount} / {totalCount} ({Math.round(progressPercentage)}%)
          </div>
        </div>

        <div className="achievements-controls">
          <div className="filter-controls">
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              全部
            </button>
            <button 
              className={filter === 'unlocked' ? 'active' : ''} 
              onClick={() => setFilter('unlocked')}
            >
              已解锁
            </button>
            <button 
              className={filter === 'locked' ? 'active' : ''} 
              onClick={() => setFilter('locked')}
            >
              未解锁
            </button>
          </div>
          <div className="hidden-toggle">
            <label>
              <input 
                type="checkbox" 
                checked={showHidden} 
                onChange={() => setShowHidden(!showHidden)} 
              />
              显示隐藏成就
            </label>
          </div>
        </div>

        <div className="achievements-list">
          {filteredAchievements.length > 0 ? (
            filteredAchievements.map(achievement => (
              <div 
                key={achievement.id} 
                className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'} ${achievement.hidden ? 'hidden' : ''}`}
              >
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-info">
                  <h3>{achievement.title}</h3>
                  <p>{achievement.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-achievements">
              没有符合条件的成就
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementsPanel;
