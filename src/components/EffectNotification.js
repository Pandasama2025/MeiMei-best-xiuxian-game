// src/components/EffectNotification.js
import React, { useState, useEffect } from 'react';
import '../styles/WaterInkTheme.css';

/**
 * 效果通知组件 - 显示玩家选择产生的效果变化
 * @param {Object} effects - 效果对象，包含修为、灵力、因果值等变化
 * @param {boolean} show - 是否显示通知
 * @param {function} onHide - 隐藏通知的回调函数
 */
const EffectNotification = ({ effects, show, onHide }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (show) {
      setVisible(true);
      // 3秒后自动隐藏
      const timer = setTimeout(() => {
        setVisible(false);
        if (onHide) onHide();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);
  
  // 如果没有效果或不显示，则不渲染
  if (!effects || !visible) return null;
  
  // 获取所有效果项
  const effectItems = Object.entries(effects).map(([key, value]) => {
    // 根据效果值的正负显示不同样式
    const valueClass = value > 0 ? 'effect-positive' : value < 0 ? 'effect-negative' : '';
    const sign = value > 0 ? '+' : '';
    
    return (
      <div key={key} className={`effect-item ${valueClass}`}>
        <span className="effect-name">{key}:</span>
        <span className="effect-value">{sign}{value}</span>
      </div>
    );
  });
  
  return (
    <div className={`ink-effect-notification ${visible ? 'show' : 'hide'}`}>
      <div className="effect-header">效果变化</div>
      <div className="effect-content">
        {effectItems.length > 0 ? effectItems : <div>无变化</div>}
      </div>
    </div>
  );
};

export default EffectNotification;
