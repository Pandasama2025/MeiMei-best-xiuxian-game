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
  特殊解锁: [],
  技能: [],
  装备: {},
  背包: [],
  成就: [],
  属性点: 0,
  战斗力: 10,
  经验值: 0,
  下一级经验: 100,
  attributes: {
    修为: 1,
    灵力: 100,
    生命: 100,
    防御: 10,
    因果值: 0
  }
};

/**
 * 确保玩家状态完整
 * @param {Object} state - 玩家状态
 * @returns {Object} 完整的玩家状态
 */
const ensureCompleteState = (state) => {
  if (!state) {
    console.warn('玩家状态为空，使用初始状态');
    return { ...initialPlayerState };
  }

  // 创建一个新对象，合并初始状态和传入的状态
  const completeState = { ...initialPlayerState, ...state };
  
  // 确保attributes对象存在并包含所有必要属性
  completeState.attributes = {
    ...initialPlayerState.attributes,
    ...(state.attributes || {})
  };
  
  // 确保数组类型的属性始终是数组
  completeState.特殊解锁 = Array.isArray(completeState.特殊解锁) ? completeState.特殊解锁 : [];
  completeState.技能 = Array.isArray(completeState.技能) ? completeState.技能 : [];
  completeState.背包 = Array.isArray(completeState.背包) ? completeState.背包 : [];
  completeState.成就 = Array.isArray(completeState.成就) ? completeState.成就 : [];
  
  // 确保对象类型的属性始终是对象
  completeState.装备 = typeof completeState.装备 === 'object' && completeState.装备 !== null ? completeState.装备 : {};
  
  // 同步主属性和attributes中的属性
  completeState.attributes.修为 = completeState.修为;
  completeState.attributes.灵力 = completeState.灵力;
  completeState.attributes.生命 = completeState.生命;
  completeState.attributes.防御 = completeState.防御;
  completeState.attributes.因果值 = completeState.因果值;
  
  // 确保数值类型的属性始终是数值
  ['生命', '灵力', '修为', '因果值', '防御', '战斗力', '经验值', '下一级经验', '属性点', '周目'].forEach(key => {
    completeState[key] = typeof completeState[key] === 'number' ? completeState[key] : initialPlayerState[key];
  });

  console.log('状态完整性检查完成:', completeState);
  return completeState;
};

/**
 * 加载游戏
 * @returns {Object|null} 游戏存档数据
 */
export const loadGame = () => {
  try {
    console.log('尝试加载游戏存档...');
    const data = localStorage.getItem('gameState');
    if (data) {
      const parsedData = JSON.parse(data);
      console.log('成功加载游戏存档:', parsedData);
      
      if (parsedData.playerState) {
        parsedData.playerState = ensureCompleteState(parsedData.playerState);
        console.log('处理后的玩家状态:', parsedData.playerState);
      } else {
        console.warn('存档中没有玩家状态数据，使用初始状态');
        parsedData.playerState = { ...initialPlayerState };
      }
      
      return parsedData;
    } else {
      console.log('未找到游戏存档，返回null');
      return null;
    }
  } catch (error) {
    console.error('加载游戏失败:', error);
    return null;
  }
};

// 创建状态管理
export const usePlayerState = create((set) => {
  console.log('初始化玩家状态...');
  const savedGameData = loadGame();
  console.log('从存档加载的游戏数据:', savedGameData);
  
  // 初始化玩家状态
  let initialState = {
    playerState: ensureCompleteState(savedGameData?.playerState || null)
  };
  
  console.log('初始化完成的玩家状态:', initialState.playerState);
  
  return {
    ...initialState,
    setPlayerState: (newState) => {
      console.log('设置新的玩家状态:', newState);
      set({ playerState: ensureCompleteState(newState) });
    }
  };
});

/**
 * 更新玩家状态
 * @param {Object} effects - 效果对象
 */
export const updatePlayerState = (effects) => {
  if (!effects) return;

  const { playerState, setPlayerState } = usePlayerState.getState();
  if (!playerState) {
    console.error('更新玩家状态失败: playerState未定义');
    return;
  }
  
  const newState = { ...playerState };

  Object.entries(effects).forEach(([key, value]) => {
    if (typeof value === 'object' && value.value !== undefined) {
      if (evaluateEffectCondition(value.condition, playerState)) {
        newState[key] = (newState[key] || 0) + value.value;
      }
    } else {
      newState[key] = (newState[key] || 0) + value;
    }
    
    applyStatLimits(newState, key);
    
    if (['修为', '灵力', '生命', '防御', '因果值'].includes(key)) {
      if (!newState.attributes) newState.attributes = {};
      newState.attributes[key] = newState[key];
    }
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
  if (!playerState) return false;

  if (typeof condition === 'string') {
    const parts = condition.match(/([^\s><!=]+)\s*([><!=]+)\s*(\d+)/);
    if (!parts) return false;

    const [, statName, operator, valueStr] = parts;
    const statValue = playerState[statName] || 0;
    const compareValue = parseInt(valueStr, 10);

    switch (operator) {
      case '>': return statValue > compareValue;
      case '<': return statValue < compareValue;
      case '>=': return statValue >= compareValue;
      case '<=': return statValue <= compareValue;
      case '==': return statValue === compareValue;
      case '!=': return statValue !== compareValue;
      default: return false;
    }
  }

  if (typeof condition === 'object') {
    return Object.entries(condition).every(([key, value]) => {
      if (key === 'hasUnlock') {
        if (!Array.isArray(playerState.特殊解锁)) return false;
        
        if (Array.isArray(value)) {
          return value.every(v => playerState.特殊解锁.includes(v));
        }
        return playerState.特殊解锁.includes(value);
      }
      
      if (key === 'notUnlock') {
        if (!Array.isArray(playerState.特殊解锁)) return true;
        
        if (Array.isArray(value)) {
          return !value.some(v => playerState.特殊解锁.includes(v));
        }
        return !playerState.特殊解锁.includes(value);
      }
      
      const statValue = playerState[key] || 0;
      
      if (typeof value === 'object') {
        return Object.entries(value).every(([op, val]) => {
          switch (op) {
            case 'gt': return statValue > val;
            case 'lt': return statValue < val;
            case 'gte': return statValue >= val;
            case 'lte': return statValue <= val;
            case 'eq': return statValue === val;
            case 'neq': return statValue !== val;
            default: return false;
          }
        });
      }
      
      return statValue === value;
    });
  }
  
  return false;
};

/**
 * 应用属性限制
 * @param {Object} state - 状态对象
 * @param {string} key - 属性名
 */
const applyStatLimits = (state, key) => {
  if (!state) return;
  
  if (key === '生命' && state.生命 < 0) {
    state.生命 = 0;
  }
  
  if (key === '灵力' && state.灵力 < 0) {
    state.灵力 = 0;
  }
  
  if (key === '修为' && state.修为 < 1) {
    state.修为 = 1;
  }
  
  if (['修为', '灵力', '生命', '防御'].includes(key)) {
    if (!state.attributes) state.attributes = {};
    state.attributes[key] = state[key];
  }
};

/**
 * 保存游戏
 * @param {string|null} chapterId - 章节ID
 * @param {Object} playerState - 玩家状态
 */
export const saveGame = (chapterId, playerState) => {
  try {
    if (!playerState) {
      console.error('保存游戏失败: playerState未定义');
      return;
    }
    
    const completeState = ensureCompleteState(playerState);
    
    const gameState = {
      chapterId: chapterId || null,
      playerState: completeState,
      saveDate: new Date().toISOString()
    };
    
    localStorage.setItem('gameState', JSON.stringify(gameState));
    console.log('游戏已保存:', gameState);
  } catch (error) {
    console.error('保存游戏失败:', error);
  }
};

/**
 * 开始新游戏
 * @param {Object} newGamePlusRules - 多周目规则
 * @returns {Object} 新的游戏状态
 */
export const startNewGame = (newGamePlusRules = null) => {
  try {
    console.log('开始新游戏...');
    let initialState = { ...initialPlayerState };
    
    if (newGamePlusRules) {
      console.log('应用多周目规则:', newGamePlusRules);
      initialState = startNewGamePlus(initialState, newGamePlusRules);
    }
    
    const completeState = ensureCompleteState(initialState);
    
    saveGame('chapter1', completeState);
    
    const { setPlayerState } = usePlayerState.getState();
    setPlayerState(completeState);
    
    console.log('新游戏已开始:', completeState);
    return completeState;
  } catch (error) {
    console.error('开始新游戏失败:', error);
    return initialPlayerState;
  }
};
