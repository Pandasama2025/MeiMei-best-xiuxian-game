/**
 * 背包系统管理工具
 */

/**
 * 获取背包数据
 * @returns {Object} 背包数据
 */
export const getInventory = () => {
  try {
    const data = localStorage.getItem('inventory');
    return data ? JSON.parse(data) : {
      items: [],
      equipment: {
        武器: null,
        护甲: null,
        饰品: null,
        法宝: null
      },
      capacity: 20
    };
  } catch (error) {
    console.error('获取背包数据失败:', error);
    return {
      items: [],
      equipment: {
        武器: null,
        护甲: null,
        饰品: null,
        法宝: null
      },
      capacity: 20
    };
  }
};

/**
 * 保存背包数据
 * @param {Object} data - 背包数据
 */
export const saveInventory = (data) => {
  try {
    localStorage.setItem('inventory', JSON.stringify(data));
  } catch (error) {
    console.error('保存背包数据失败:', error);
  }
};

/**
 * 物品定义
 */
export const ITEMS = {
  // 武器
  "锈剑": {
    id: "锈剑",
    name: "锈剑",
    type: "武器",
    description: "一把普通的锈迹斑斑的剑，似乎曾经历过无数战斗。",
    effects: {
      攻击: 5
    },
    rarity: "普通",
    icon: "🗡️"
  },
  "青锋剑": {
    id: "青锋剑",
    name: "青锋剑",
    type: "武器",
    description: "凌尘剑宗入门弟子的配剑，锋利无比。",
    effects: {
      攻击: 10,
      灵力: 5
    },
    rarity: "精良",
    icon: "⚔️"
  },
  "玄铁重剑": {
    id: "玄铁重剑",
    name: "玄铁重剑",
    type: "武器",
    description: "由玄铁铸造的重剑，威力强大但需要较高的力量才能挥动。",
    effects: {
      攻击: 20,
      速度: -5
    },
    rarity: "稀有",
    icon: "⚔️"
  },
  
  // 护甲
  "布衣": {
    id: "布衣",
    name: "布衣",
    type: "护甲",
    description: "普通的布衣，提供基础防护。",
    effects: {
      防御: 3
    },
    rarity: "普通",
    icon: "👕"
  },
  "道袍": {
    id: "道袍",
    name: "道袍",
    type: "护甲",
    description: "修士常穿的道袍，略有灵力加成。",
    effects: {
      防御: 5,
      灵力: 10
    },
    rarity: "精良",
    icon: "👘"
  },
  "凌云战衣": {
    id: "凌云战衣",
    name: "凌云战衣",
    type: "护甲",
    description: "凌尘剑宗精英弟子的战衣，提供强大的防护和灵力增益。",
    effects: {
      防御: 15,
      灵力: 20
    },
    rarity: "稀有",
    icon: "🥋"
  },
  
  // 饰品
  "玉佩": {
    id: "玉佩",
    name: "玉佩",
    type: "饰品",
    description: "普通的玉佩，略有灵力加成。",
    effects: {
      灵力: 5
    },
    rarity: "普通",
    icon: "🧿"
  },
  "灵珠": {
    id: "灵珠",
    name: "灵珠",
    type: "饰品",
    description: "蕴含灵气的珠子，可以提升修炼速度。",
    effects: {
      修为获取: 10
    },
    rarity: "精良",
    icon: "💎"
  },
  "宿命玉佩": {
    id: "宿命玉佩",
    name: "宿命玉佩",
    type: "饰品",
    description: "传说中可以改变命运的玉佩，似乎有着不为人知的秘密。",
    effects: {
      灵力: 15,
      因果抗性: 10
    },
    rarity: "稀有",
    icon: "🔮",
    unique: true,
    evolution: {
      stages: ["裂痕Ⅰ", "裂痕Ⅱ", "裂痕Ⅲ", "觉醒"],
      currentStage: 0
    }
  },
  
  // 法宝
  "引灵符": {
    id: "引灵符",
    name: "引灵符",
    type: "法宝",
    description: "可以引导灵气的符咒，提升灵力恢复速度。",
    effects: {
      灵力恢复: 5
    },
    rarity: "普通",
    icon: "📜"
  },
  "聚灵盘": {
    id: "聚灵盘",
    name: "聚灵盘",
    type: "法宝",
    description: "可以聚集周围灵气的法器，大幅提升灵力恢复速度。",
    effects: {
      灵力恢复: 15,
      灵力: 10
    },
    rarity: "精良",
    icon: "🔘"
  },
  "太虚剑气": {
    id: "太虚剑气",
    name: "太虚剑气",
    type: "法宝",
    description: "凌尘剑宗镇派之宝，可以释放强大的剑气攻击敌人。",
    effects: {
      攻击: 25,
      剑气伤害: 30
    },
    rarity: "稀有",
    icon: "⚡",
    skill: {
      name: "剑气斩",
      description: "释放强大的剑气攻击敌人，造成大量伤害。",
      cooldown: 3,
      damage: 50
    }
  },
  
  // 消耗品
  "灵力丹": {
    id: "灵力丹",
    name: "灵力丹",
    type: "消耗品",
    description: "恢复少量灵力的丹药。",
    effects: {
      灵力: 30
    },
    rarity: "普通",
    icon: "💊",
    consumable: true
  },
  "回春丹": {
    id: "回春丹",
    name: "回春丹",
    type: "消耗品",
    description: "恢复少量生命的丹药。",
    effects: {
      生命: 30
    },
    rarity: "普通",
    icon: "💊",
    consumable: true
  },
  "筑基丹": {
    id: "筑基丹",
    name: "筑基丹",
    type: "消耗品",
    description: "提升修为的丹药。",
    effects: {
      修为: 5
    },
    rarity: "精良",
    icon: "💊",
    consumable: true
  },
  
  // 任务物品
  "剑冢钥匙": {
    id: "剑冢钥匙",
    name: "剑冢钥匙",
    type: "任务物品",
    description: "打开剑冢深处的钥匙，需要集齐四块碎片。",
    rarity: "稀有",
    icon: "🔑",
    quest: true,
    parts: 4,
    currentParts: 0
  },
  "轮回井水": {
    id: "轮回井水",
    name: "轮回井水",
    type: "任务物品",
    description: "从轮回井中取出的神秘井水，似乎可以看到过去和未来。",
    rarity: "稀有",
    icon: "💧",
    quest: true
  },
  "白子墨的信": {
    id: "白子墨的信",
    name: "白子墨的信",
    type: "任务物品",
    description: "白子墨留下的信，记载着他的秘密。",
    rarity: "稀有",
    icon: "📝",
    quest: true,
    readable: true,
    content: "若你看到这封信，说明我已经离开了。剑冢的秘密不可告人，切记不要深入其中..."
  }
};

/**
 * 添加物品到背包
 * @param {string} itemId - 物品ID
 * @param {number} quantity - 数量
 * @returns {boolean} 是否成功
 */
export const addItem = (itemId, quantity = 1) => {
  const inventory = getInventory();
  const item = ITEMS[itemId];
  
  if (!item) {
    console.error(`物品 ${itemId} 不存在`);
    return false;
  }
  
  // 检查背包容量
  if (inventory.items.length >= inventory.capacity && 
      !inventory.items.some(i => i.id === itemId)) {
    console.error('背包已满');
    return false;
  }
  
  // 处理任务物品的特殊逻辑
  if (item.quest && item.parts) {
    const existingItem = inventory.items.find(i => i.id === itemId);
    if (existingItem) {
      existingItem.currentParts = Math.min(existingItem.currentParts + quantity, item.parts);
    } else {
      inventory.items.push({
        ...item,
        currentParts: quantity
      });
    }
  } 
  // 处理普通物品
  else {
    const existingItem = inventory.items.find(i => i.id === itemId);
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + quantity;
    } else {
      inventory.items.push({
        ...item,
        quantity: quantity
      });
    }
  }
  
  saveInventory(inventory);
  return true;
};

/**
 * 从背包移除物品
 * @param {string} itemId - 物品ID
 * @param {number} quantity - 数量
 * @returns {boolean} 是否成功
 */
export const removeItem = (itemId, quantity = 1) => {
  const inventory = getInventory();
  const itemIndex = inventory.items.findIndex(i => i.id === itemId);
  
  if (itemIndex === -1) {
    console.error(`物品 ${itemId} 不在背包中`);
    return false;
  }
  
  const item = inventory.items[itemIndex];
  
  // 处理任务物品的特殊逻辑
  if (item.quest && item.parts) {
    item.currentParts = Math.max(0, item.currentParts - quantity);
    if (item.currentParts === 0) {
      inventory.items.splice(itemIndex, 1);
    }
  } 
  // 处理普通物品
  else {
    item.quantity = (item.quantity || 1) - quantity;
    if (item.quantity <= 0) {
      inventory.items.splice(itemIndex, 1);
    }
  }
  
  saveInventory(inventory);
  return true;
};

/**
 * 装备物品
 * @param {string} itemId - 物品ID
 * @returns {boolean} 是否成功
 */
export const equipItem = (itemId) => {
  const inventory = getInventory();
  const item = inventory.items.find(i => i.id === itemId);
  
  if (!item) {
    console.error(`物品 ${itemId} 不在背包中`);
    return false;
  }
  
  if (!item.type || !['武器', '护甲', '饰品', '法宝'].includes(item.type)) {
    console.error(`物品 ${itemId} 不可装备`);
    return false;
  }
  
  // 卸下当前装备
  const currentEquipped = inventory.equipment[item.type];
  if (currentEquipped) {
    // 将当前装备放回背包
    addItem(currentEquipped.id);
  }
  
  // 装备新物品
  inventory.equipment[item.type] = item;
  
  // 从背包中移除
  removeItem(itemId);
  
  saveInventory(inventory);
  return true;
};

/**
 * 卸下装备
 * @param {string} slot - 装备槽位
 * @returns {boolean} 是否成功
 */
export const unequipItem = (slot) => {
  const inventory = getInventory();
  
  if (!inventory.equipment[slot]) {
    console.error(`槽位 ${slot} 没有装备`);
    return false;
  }
  
  // 检查背包容量
  if (inventory.items.length >= inventory.capacity) {
    console.error('背包已满，无法卸下装备');
    return false;
  }
  
  // 将装备放回背包
  const item = inventory.equipment[slot];
  addItem(item.id);
  
  // 清空槽位
  inventory.equipment[slot] = null;
  
  saveInventory(inventory);
  return true;
};

/**
 * 使用消耗品
 * @param {string} itemId - 物品ID
 * @param {Object} playerState - 玩家状态
 * @param {Function} updatePlayerState - 更新玩家状态的函数
 * @returns {boolean} 是否成功
 */
export const consumeItem = (itemId, playerState, updatePlayerState) => {
  const inventory = getInventory();
  const item = inventory.items.find(i => i.id === itemId);
  
  if (!item) {
    console.error(`物品 ${itemId} 不在背包中`);
    return false;
  }
  
  if (!item.consumable) {
    console.error(`物品 ${itemId} 不是消耗品`);
    return false;
  }
  
  // 应用效果
  if (item.effects && updatePlayerState) {
    updatePlayerState(item.effects);
  }
  
  // 从背包中移除
  removeItem(itemId);
  
  return true;
};

/**
 * 获取装备属性加成
 * @returns {Object} 属性加成
 */
export const getEquipmentBonuses = () => {
  const inventory = getInventory();
  const bonuses = {};
  
  // 计算所有装备的属性加成
  Object.values(inventory.equipment).forEach(item => {
    if (item && item.effects) {
      Object.entries(item.effects).forEach(([stat, value]) => {
        bonuses[stat] = (bonuses[stat] || 0) + value;
      });
    }
  });
  
  return bonuses;
};

/**
 * 进化特殊物品
 * @param {string} itemId - 物品ID
 * @returns {boolean} 是否成功
 */
export const evolveItem = (itemId) => {
  const inventory = getInventory();
  const item = inventory.items.find(i => i.id === itemId);
  
  if (!item) {
    console.error(`物品 ${itemId} 不在背包中`);
    return false;
  }
  
  if (!item.evolution) {
    console.error(`物品 ${itemId} 不可进化`);
    return false;
  }
  
  // 检查是否可以进化
  if (item.evolution.currentStage >= item.evolution.stages.length - 1) {
    console.error(`物品 ${itemId} 已达到最高进化阶段`);
    return false;
  }
  
  // 进化物品
  item.evolution.currentStage += 1;
  item.name = `${ITEMS[itemId].name}(${item.evolution.stages[item.evolution.currentStage]})`;
  
  // 根据进化阶段增强效果
  const stageBonus = item.evolution.currentStage * 5;
  Object.keys(item.effects).forEach(stat => {
    item.effects[stat] += stageBonus;
  });
  
  saveInventory(inventory);
  return true;
};
