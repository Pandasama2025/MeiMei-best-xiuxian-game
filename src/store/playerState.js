// src/store/playerState.js
import { create } from 'zustand';
import { startNewGamePlus } from '../utils/newGamePlus';

// 初始玩家状态
const initialPlayerState = {
  生命: 100,
  灵力: 100,
  修为: 1,
  因果值: 0,
  剑冢共鸣: 0,
  白子墨执念: 0,
  轮回井等级: 0,
  防御: 10,
  周目: 1,
  特殊解锁: []
};

// 创建状态管理
export const usePlayerState = create((set) => ({
  playerState: loadGame()?.playerState || { ...initialPlayerState },
  setPlayerState: (newState) => set({ playerState: newState }),
}));

/**
 * 更新玩家状态
 * @param {Object} effects - 效果对象
 */
export const updatePlayerState = (effects) => {
  if (!effects) return;

  const { playerState, setPlayerState } = usePlayerState.getState();
  const newState = { ...playerState };

  Object.entries(effects).forEach(([key, value]) => {
    // 处理复杂效果
    if (typeof value === 'object' && value.value !== undefined) {
      if (evaluateEffectCondition(value.condition, playerState)) {
        newState[key] = (newState[key] || 0) + value.value;
      }
    } else {
      // 处理简单效果
      newState[key] = (newState[key] || 0) + value;
    }
    
    // 应用属性限制
    applyStatLimits(newState, key);
  });

  setPlayerState(newState);
  saveGame(null, newState);
};

/**
 * 评估效果条件
 * @param {Object} condition - 条件对象
 * @param {Object} playerState - 玩家状态
 * @returns {boolean} 是否满足条件
 */
const evaluateEffectCondition = (condition, playerState) => {
  if (!condition) return true;
  
  // 处理AND条件
  if (condition.and) {
    return condition.and.every(subCondition => 
      evaluateEffectCondition(subCondition, playerState)
    );
  }
  
  // 处理OR条件
  if (condition.or) {
    return condition.or.some(subCondition => 
      evaluateEffectCondition(subCondition, playerState)
    );
  }
  
  // 处理NOT条件
  if (condition.not) {
    return !evaluateEffectCondition(condition.not, playerState);
  }
  
  // 处理简单条件
  return Object.entries(condition).every(([stat, requirement]) => {
    const value = playerState[stat];
    if (typeof requirement === 'object') {
      if (requirement.min !== undefined && value < requirement.min) return false;
      if (requirement.max !== undefined && value > requirement.max) return false;
      return true;
    }
    return value === requirement;
  });
};

/**
 * 应用属性限制
 * @param {Object} state - 状态对象
 * @param {string} key - 属性名
 */
const applyStatLimits = (state, key) => {
  const limits = {
    生命: { min: 0, max: 999 },
    灵力: { min: 0, max: 999 },
    修为: { min: 1, max: 999 },
    因果值: { min: -100, max: 100 },
    剑冢共鸣: { min: 0, max: 100 },
    白子墨执念: { min: 0, max: 100 },
    轮回井等级: { min: 0, max: 9 },
    防御: { min: 0, max: 999 }
  };

  if (limits[key]) {
    state[key] = Math.max(limits[key].min, Math.min(state[key], limits[key].max));
  }
};

/**
 * 保存游戏
 * @param {string|null} chapterId - 章节ID
 * @param {Object} playerState - 玩家状态
 */
export const saveGame = (chapterId, playerState) => {
  try {
    const saveData = {
      chapterId: chapterId || loadGame()?.chapterId,
      playerState,
      timestamp: Date.now()
    };
    localStorage.setItem('gameState', JSON.stringify(saveData));
  } catch (error) {
    console.error('保存游戏失败:', error);
  }
};

/**
 * 加载游戏
 * @returns {Object|null} 游戏存档数据
 */
export const loadGame = () => {
  try {
    const data = localStorage.getItem('gameState');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('加载游戏失败:', error);
    return null;
  }
};

/**
 * 开始新游戏
 * @param {Object} newGamePlusRules - 多周目规则
 * @returns {Object} 新的游戏状态
 */
export const startNewGame = (newGamePlusRules = null) => {
  const currentState = usePlayerState.getState().playerState;
  let newState;
  
  if (newGamePlusRules && currentState.周目 > 0) {
    // 开始新周目
    newState = startNewGamePlus(currentState, newGamePlusRules);
  } else {
    // 开始全新游戏
    newState = { ...initialPlayerState };
  }
  
  // 更新状态
  usePlayerState.getState().setPlayerState(newState);
  
  // 保存游戏
  saveGame('chapter1', newState);
  
  return newState;
};
