/**
 * 多周目系统管理工具
 */

/**
 * 获取多周目数据
 * @returns {Object} 多周目数据
 */
export const getNewGamePlusData = () => {
  try {
    const data = localStorage.getItem('newGamePlusData');
    return data ? JSON.parse(data) : {
      completedPlaythroughs: 0,
      unlockedAchievements: [],
      inheritedStats: {},
      specialUnlocks: []
    };
  } catch (error) {
    console.error('获取多周目数据失败:', error);
    return {
      completedPlaythroughs: 0,
      unlockedAchievements: [],
      inheritedStats: {},
      specialUnlocks: []
    };
  }
};

/**
 * 保存多周目数据
 * @param {Object} data - 多周目数据
 */
export const saveNewGamePlusData = (data) => {
  try {
    localStorage.setItem('newGamePlusData', JSON.stringify(data));
  } catch (error) {
    console.error('保存多周目数据失败:', error);
  }
};

/**
 * 计算可继承的属性
 * @param {Object} playerState - 玩家状态
 * @param {Object} newGamePlusRules - 多周目规则
 * @returns {Object} 可继承的属性
 */
export const calculateInheritableStats = (playerState, newGamePlusRules) => {
  const inheritableStats = {};
  
  Object.entries(newGamePlusRules.inheritableStats || {}).forEach(([stat, rule]) => {
    if (playerState[stat] !== undefined) {
      // 计算继承值
      let value = playerState[stat];
      
      // 应用继承规则
      if (rule.percentage) {
        value = Math.floor(value * (rule.percentage / 100));
      }
      
      // 应用上限
      if (rule.max !== undefined) {
        value = Math.min(value, rule.max);
      }
      
      // 应用下限
      if (rule.min !== undefined) {
        value = Math.max(value, rule.min);
      }
      
      inheritableStats[stat] = value;
    }
  });
  
  return inheritableStats;
};

/**
 * 开始新的周目
 * @param {Object} currentState - 当前游戏状态
 * @param {Object} newGamePlusRules - 多周目规则
 * @returns {Object} 新的游戏状态
 */
export const startNewGamePlus = (currentState, newGamePlusRules) => {
  const ngPlusData = getNewGamePlusData();
  
  // 增加完成次数
  ngPlusData.completedPlaythroughs += 1;
  
  // 计算继承属性
  const inheritedStats = calculateInheritableStats(currentState, newGamePlusRules);
  ngPlusData.inheritedStats = inheritedStats;
  
  // 检查特殊解锁
  if (newGamePlusRules.specialUnlocks) {
    newGamePlusRules.specialUnlocks.forEach(unlock => {
      if (evaluateUnlockCondition(unlock.condition, currentState, ngPlusData)) {
        if (!ngPlusData.specialUnlocks.includes(unlock.id)) {
          ngPlusData.specialUnlocks.push(unlock.id);
        }
      }
    });
  }
  
  // 保存多周目数据
  saveNewGamePlusData(ngPlusData);
  
  // 返回新的游戏状态
  return {
    ...newGamePlusRules.initialState,
    ...inheritedStats,
    周目: ngPlusData.completedPlaythroughs + 1,
    特殊解锁: ngPlusData.specialUnlocks
  };
};

/**
 * 评估解锁条件
 * @param {Object|string} condition - 解锁条件
 * @param {Object} playerState - 玩家状态
 * @param {Object} ngPlusData - 多周目数据
 * @returns {boolean} 是否满足条件
 */
const evaluateUnlockCondition = (condition, playerState, ngPlusData) => {
  if (!condition) return true;
  
  // 处理字符串条件
  if (typeof condition === 'string') {
    // 解析条件字符串
    const parts = condition.split(' ');
    if (parts.length !== 3) return false;
    
    const [stat, operator, valueStr] = parts;
    const value = Number(valueStr);
    
    switch (operator) {
      case '>': return playerState[stat] > value;
      case '<': return playerState[stat] < value;
      case '>=': return playerState[stat] >= value;
      case '<=': return playerState[stat] <= value;
      case '=': return playerState[stat] === value;
      default: return false;
    }
  }
  
  // 处理对象条件
  if (typeof condition === 'object') {
    // 处理AND条件
    if (condition.and) {
      return condition.and.every(subCondition => 
        evaluateUnlockCondition(subCondition, playerState, ngPlusData)
      );
    }
    
    // 处理OR条件
    if (condition.or) {
      return condition.or.some(subCondition => 
        evaluateUnlockCondition(subCondition, playerState, ngPlusData)
      );
    }
    
    // 处理周目数条件
    if (condition.completedPlaythroughs !== undefined) {
      return ngPlusData.completedPlaythroughs >= condition.completedPlaythroughs;
    }
    
    // 处理成就条件
    if (condition.achievement) {
      return ngPlusData.unlockedAchievements.includes(condition.achievement);
    }
    
    // 处理特殊解锁条件
    if (condition.specialUnlock) {
      return ngPlusData.specialUnlocks.includes(condition.specialUnlock);
    }
  }
  
  return false;
};

/**
 * 检查是否可以开始新周目
 * @param {Object} playerState - 玩家状态
 * @param {Object} newGamePlusRules - 多周目规则
 * @returns {boolean} 是否可以开始新周目
 */
export const canStartNewGamePlus = (playerState, newGamePlusRules) => {
  if (!newGamePlusRules.requirements) return true;
  
  return evaluateUnlockCondition(newGamePlusRules.requirements, playerState, getNewGamePlusData());
};
