// src/components/Options.js
import React from 'react';
import '../styles/WaterInkTheme.css';
import { usePlayerState } from '../store/playerState';

/**
 * 评估条件是否满足
 * @param {Object} condition - 条件对象
 * @param {Object} playerState - 玩家状态
 * @returns {boolean} 条件是否满足
 */
const evaluateCondition = (condition, playerState) => {
  if (!condition) return true;
  
  // 处理简单条件（如 "因果值 > 10"）
  if (typeof condition === 'string') {
    // 解析条件字符串
    const operators = ['>=', '<=', '>', '<', '=', '!='];
    let operator = null;
    let parts = [];
    
    // 查找使用的操作符
    for (const op of operators) {
      if (condition.includes(op)) {
        operator = op;
        parts = condition.split(op).map(part => part.trim());
        break;
      }
    }
    
    if (!operator || parts.length !== 2) return true;
    
    const [statName, valueStr] = parts;
    const value = isNaN(Number(valueStr)) ? valueStr : Number(valueStr);
    
    // 检查状态是否存在
    if (!(statName in playerState)) return false;
    
    // 比较值
    const statValue = playerState[statName];
    
    switch (operator) {
      case '>=': return statValue >= value;
      case '<=': return statValue <= value;
      case '>': return statValue > value;
      case '<': return statValue < value;
      case '=': return statValue === value;
      case '!=': return statValue !== value;
      default: return true;
    }
  }
  
  // 处理复杂条件对象
  if (typeof condition === 'object') {
    // 处理AND条件（所有条件都必须满足）
    if (condition.and && Array.isArray(condition.and)) {
      return condition.and.every(cond => evaluateCondition(cond, playerState));
    }
    
    // 处理OR条件（至少一个条件满足）
    if (condition.or && Array.isArray(condition.or)) {
      return condition.or.some(cond => evaluateCondition(cond, playerState));
    }
    
    // 处理NOT条件（条件不满足）
    if (condition.not) {
      return !evaluateCondition(condition.not, playerState);
    }
    
    // 处理直接的键值对条件
    return Object.entries(condition).every(([key, value]) => {
      if (!(key in playerState)) return false;
      
      if (typeof value === 'object' && value !== null) {
        if ('min' in value && playerState[key] < value.min) return false;
        if ('max' in value && playerState[key] > value.max) return false;
        return true;
      }
      
      return playerState[key] === value;
    });
  }
  
  return true;
};

const Options = ({ options, onSelect }) => {
  const { playerState } = usePlayerState();
  
  if (!options || options.length === 0) return null;
  
  // 过滤可用选项
  const availableOptions = options.filter(option => {
    // 如果没有条件，则选项可用
    if (!option.conditions) return true;
    
    // 评估条件
    return evaluateCondition(option.conditions, playerState);
  });
  
  // 如果没有可用选项，显示默认选项
  if (availableOptions.length === 0) {
    return (
      <div className="ink-container">
        <div className="options-container">
          <button 
            className="ink-button disabled"
            disabled
          >
            无可用选择...
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="ink-container">
      <div className="options-container">
        {availableOptions.map((option, index) => (
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
