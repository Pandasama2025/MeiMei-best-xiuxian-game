/**
 * 成就系统管理工具
 */

/**
 * 获取成就数据
 * @returns {Object} 成就数据
 */
export const getAchievements = () => {
  try {
    const data = localStorage.getItem('achievements');
    return data ? JSON.parse(data) : {
      unlocked: [],
      progress: {}
    };
  } catch (error) {
    console.error('获取成就数据失败:', error);
    return {
      unlocked: [],
      progress: {}
    };
  }
};

/**
 * 保存成就数据
 * @param {Object} data - 成就数据
 */
export const saveAchievements = (data) => {
  try {
    localStorage.setItem('achievements', JSON.stringify(data));
  } catch (error) {
    console.error('保存成就数据失败:', error);
  }
};

/**
 * 成就定义
 */
export const ACHIEVEMENTS = {
  // 故事进度成就
  "初入修真界": {
    id: "初入修真界",
    title: "初入修真界",
    description: "完成游戏序章",
    icon: "🌱",
    hidden: false,
    condition: {
      type: "chapter",
      chapterId: "chapter2"
    }
  },
  "踏入剑冢": {
    id: "踏入剑冢",
    title: "踏入剑冢",
    description: "第一次进入剑冢",
    icon: "⚔️",
    hidden: false,
    condition: {
      type: "chapter",
      chapterId: "sword_tomb_entrance"
    }
  },
  "轮回之井": {
    id: "轮回之井",
    title: "轮回之井",
    description: "发现轮回井",
    icon: "🕳️",
    hidden: false,
    condition: {
      type: "chapter",
      chapterId: "reincarnation_well"
    }
  },
  
  // 战斗成就
  "初战告捷": {
    id: "初战告捷",
    title: "初战告捷",
    description: "赢得第一场战斗",
    icon: "🏆",
    hidden: false,
    condition: {
      type: "battle",
      count: 1
    }
  },
  "战无不胜": {
    id: "战无不胜",
    title: "战无不胜",
    description: "连续赢得10场战斗",
    icon: "🔥",
    hidden: false,
    condition: {
      type: "battle",
      streak: 10
    }
  },
  "一击必杀": {
    id: "一击必杀",
    title: "一击必杀",
    description: "一回合内击败敌人",
    icon: "⚡",
    hidden: false,
    condition: {
      type: "battle",
      oneHitKill: true
    }
  },
  
  // 属性成就
  "修为小成": {
    id: "修为小成",
    title: "修为小成",
    description: "修为达到50",
    icon: "📈",
    hidden: false,
    condition: {
      type: "stat",
      stat: "修为",
      value: 50
    }
  },
  "灵力充盈": {
    id: "灵力充盈",
    title: "灵力充盈",
    description: "灵力达到200",
    icon: "✨",
    hidden: false,
    condition: {
      type: "stat",
      stat: "灵力",
      value: 200
    }
  },
  "因果通明": {
    id: "因果通明",
    title: "因果通明",
    description: "因果值达到100",
    icon: "☯️",
    hidden: false,
    condition: {
      type: "stat",
      stat: "因果值",
      value: 100
    }
  },
  
  // 隐藏成就
  "轮回者": {
    id: "轮回者",
    title: "轮回者",
    description: "使用轮回井3次",
    icon: "🔄",
    hidden: true,
    condition: {
      type: "stat",
      stat: "轮回井等级",
      value: 3
    }
  },
  "剑魂共鸣": {
    id: "剑魂共鸣",
    title: "剑魂共鸣",
    description: "剑冢共鸣达到100",
    icon: "🗡️",
    hidden: true,
    condition: {
      type: "stat",
      stat: "剑冢共鸣",
      value: 100
    }
  },
  "白子墨之谜": {
    id: "白子墨之谜",
    title: "白子墨之谜",
    description: "解开白子墨的全部谜团",
    icon: "❓",
    hidden: true,
    condition: {
      type: "stat",
      stat: "白子墨执念",
      value: 100
    }
  },
  
  // 多周目成就
  "轮回转世": {
    id: "轮回转世",
    title: "轮回转世",
    description: "开始第二周目",
    icon: "🌀",
    hidden: false,
    condition: {
      type: "stat",
      stat: "周目",
      value: 2
    }
  },
  "命运主宰": {
    id: "命运主宰",
    title: "命运主宰",
    description: "完成三个不同结局",
    icon: "👑",
    hidden: true,
    condition: {
      type: "endings",
      count: 3
    }
  }
};

/**
 * 检查成就解锁
 * @param {Object} playerState - 玩家状态
 * @param {string} chapterId - 当前章节ID
 * @param {Object} battleData - 战斗数据
 * @returns {Array} 新解锁的成就
 */
export const checkAchievements = (playerState, chapterId = null, battleData = null) => {
  const achievementData = getAchievements();
  const newlyUnlocked = [];
  
  // 检查每个成就
  Object.values(ACHIEVEMENTS).forEach(achievement => {
    // 如果已解锁，跳过
    if (achievementData.unlocked.includes(achievement.id)) {
      return;
    }
    
    let unlocked = false;
    
    // 根据条件类型检查
    switch (achievement.condition.type) {
      case "chapter":
        // 章节相关成就
        if (chapterId && chapterId === achievement.condition.chapterId) {
          unlocked = true;
        }
        break;
        
      case "stat":
        // 属性相关成就
        if (playerState[achievement.condition.stat] >= achievement.condition.value) {
          unlocked = true;
        }
        break;
        
      case "battle":
        // 战斗相关成就
        if (battleData) {
          // 战斗次数
          if (achievement.condition.count !== undefined) {
            const battleCount = achievementData.progress.battleCount || 0;
            if (battleCount + 1 >= achievement.condition.count) {
              unlocked = true;
            }
            // 更新进度
            achievementData.progress.battleCount = (battleCount + 1);
          }
          
          // 连胜
          if (achievement.condition.streak !== undefined) {
            if (battleData.victory) {
              const battleStreak = achievementData.progress.battleStreak || 0;
              if (battleStreak + 1 >= achievement.condition.streak) {
                unlocked = true;
              }
              // 更新进度
              achievementData.progress.battleStreak = (battleStreak + 1);
            } else {
              // 失败重置连胜
              achievementData.progress.battleStreak = 0;
            }
          }
          
          // 一击必杀
          if (achievement.condition.oneHitKill !== undefined && 
              battleData.victory && 
              battleData.turns === 1) {
            unlocked = true;
          }
        }
        break;
        
      case "endings":
        // 结局相关成就
        if (achievementData.progress.endings) {
          const uniqueEndingsCount = new Set(achievementData.progress.endings).size;
          if (uniqueEndingsCount >= achievement.condition.count) {
            unlocked = true;
          }
        }
        break;
        
      default:
        // 未知的成就类型
        console.warn(`未知的成就条件类型: ${achievement.condition.type}`);
        break;
    }
    
    // 如果解锁了成就
    if (unlocked) {
      achievementData.unlocked.push(achievement.id);
      newlyUnlocked.push(achievement);
    }
  });
  
  // 保存成就数据
  saveAchievements(achievementData);
  
  return newlyUnlocked;
};

/**
 * 记录游戏结局
 * @param {string} endingId - 结局ID
 */
export const recordEnding = (endingId) => {
  const achievementData = getAchievements();
  
  // 初始化结局数组
  if (!achievementData.progress.endings) {
    achievementData.progress.endings = [];
  }
  
  // 添加结局
  achievementData.progress.endings.push(endingId);
  
  // 保存成就数据
  saveAchievements(achievementData);
  
  // 检查成就
  return checkAchievements({});
};

/**
 * 获取成就显示信息
 * @param {boolean} includeHidden - 是否包含隐藏成就
 * @returns {Array} 成就显示信息
 */
export const getAchievementDisplayInfo = (includeHidden = false) => {
  const achievementData = getAchievements();
  const displayInfo = [];
  
  Object.values(ACHIEVEMENTS).forEach(achievement => {
    // 跳过隐藏成就（除非已解锁或明确要求显示）
    if (achievement.hidden && 
        !achievementData.unlocked.includes(achievement.id) && 
        !includeHidden) {
      return;
    }
    
    const isUnlocked = achievementData.unlocked.includes(achievement.id);
    
    displayInfo.push({
      id: achievement.id,
      title: achievement.title,
      description: isUnlocked ? achievement.description : (achievement.hidden ? "???" : achievement.description),
      icon: isUnlocked ? achievement.icon : "🔒",
      unlocked: isUnlocked,
      hidden: achievement.hidden && !isUnlocked
    });
  });
  
  return displayInfo;
};
