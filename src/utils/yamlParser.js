import yaml from 'js-yaml';

/**
 * 解析YAML剧情文件
 * @param {string} content - YAML文件内容
 * @returns {Object} 解析后的剧情数据
 */
export const parseStoryYAML = (content) => {
  try {
    const data = yaml.load(content);
    return transformYAMLToGameFormat(data);
  } catch (error) {
    console.error('解析YAML文件失败:', error);
    return null;
  }
};

/**
 * 将YAML数据转换为游戏格式
 * @param {Object} data - YAML数据
 * @returns {Object} 游戏格式数据
 */
const transformYAMLToGameFormat = (data) => {
  const gameData = {
    variables: data.variables || {},
    chapters: [],
    achievements: data.achievements || [],
    newGamePlus: data.newGamePlus || {},
    skills: data.skills || [],
    rewards: data.rewards || []
  };

  // 处理主线场景
  if (data.scenes) {
    gameData.chapters.push(...transformScenes(data.scenes, 'main'));
  }

  // 处理战斗场景
  if (data.battle_scenes) {
    gameData.chapters.push(...transformScenes(data.battle_scenes, 'battle'));
  }

  // 处理支线场景
  if (data.side_scenes) {
    gameData.chapters.push(...transformScenes(data.side_scenes, 'side'));
  }

  return gameData;
};

/**
 * 转换场景数据
 * @param {Array} scenes - 场景数组
 * @param {string} type - 场景类型
 * @returns {Array} 转换后的章节数组
 */
const transformScenes = (scenes, type) => {
  return scenes.map(scene => {
    const chapter = {
      id: scene.id,
      type: type,
      title: scene.title || '',
      text: scene.text || '',
      detailedText: scene.detailed_text || [],
      options: transformOptions(scene.options || []),
      trigger: scene.trigger || null,
      triggerPriority: scene.trigger_priority || 0,
      assets: transformAssets(scene.assets || {})
    };

    // 处理战斗场景特有属性
    if (type === 'battle' && scene.battle) {
      chapter.battle = transformBattleData(scene.battle);
      chapter.battleSuccess = scene.battle_success;
      chapter.battleFailure = scene.battle_failure;
    }

    return chapter;
  });
};

/**
 * 转换选项数据
 * @param {Array} options - 选项数组
 * @returns {Array} 转换后的选项数组
 */
const transformOptions = (options) => {
  return options.map(option => ({
    text: option.text,
    nextId: option.next_id,
    conditions: transformConditions(option.conditions),
    effects: transformEffects(option.effects),
    requires: option.requires || null,
    visible: option.visible || true
  }));
};

/**
 * 转换条件数据
 * @param {Array} conditions - 条件数组
 * @returns {Array} 转换后的条件数组
 */
const transformConditions = (conditions) => {
  if (!conditions) return null;

  return conditions.map(condition => ({
    requires: condition.requires || {},
    nextId: condition.next_id
  }));
};

/**
 * 转换效果数据
 * @param {Object} effects - 效果对象
 * @returns {Object} 转换后的效果对象
 */
const transformEffects = (effects) => {
  if (!effects) return {};

  const transformedEffects = {};
  
  Object.entries(effects).forEach(([key, value]) => {
    // 处理复杂效果（带条件的效果）
    if (typeof value === 'object' && value.value !== undefined) {
      transformedEffects[key] = {
        value: value.value,
        condition: value.condition,
        duration: value.duration
      };
    } else {
      transformedEffects[key] = value;
    }
  });

  return transformedEffects;
};

/**
 * 转换资源数据
 * @param {Object} assets - 资源对象
 * @returns {Object} 转换后的资源对象
 */
const transformAssets = (assets) => {
  return {
    bgm: assets.bgm || null,
    effect: assets.effect || null,
    background: assets.background || null,
    animation: assets.animation || null
  };
};

/**
 * 转换战斗数据
 * @param {Object} battle - 战斗数据
 * @returns {Object} 转换后的战斗数据
 */
const transformBattleData = (battle) => {
  return {
    enemy: {
      name: battle.enemy.name,
      hp: battle.enemy.hp,
      attack: battle.enemy.attack,
      defense: battle.enemy.defense,
      skills: transformEnemySkills(battle.enemy.skills)
    },
    rewards: battle.rewards || {},
    special_conditions: battle.special_conditions || [],
    background: battle.background || null,
    bgm: battle.bgm || null
  };
};

/**
 * 转换敌人技能数据
 * @param {Array} skills - 技能数组
 * @returns {Array} 转换后的技能数组
 */
const transformEnemySkills = (skills) => {
  if (!skills) return [];

  return skills.map(skill => ({
    name: skill.name,
    damage: skill.damage,
    effects: transformEffects(skill.effects),
    conditions: skill.conditions || null,
    probability: skill.probability || 1,
    cooldown: skill.cooldown || 0
  }));
};

/**
 * 转换技能数据
 * @param {Array} skills - 技能数组
 * @returns {Array} 转换后的技能数组
 * @todo 将在YAML支持中使用
 */
// eslint-disable-next-line no-unused-vars
const transformSkills = (skills) => {
  if (!skills) return [];

  return skills.map(skill => ({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    effects: transformEffects(skill.effects),
    conditions: skill.conditions || null,
    cooldown: skill.cooldown || 0
  }));
};

/**
 * 转换奖励数据
 * @param {Array} rewards - 奖励数组
 * @returns {Array} 转换后的奖励数组
 * @todo 将在YAML支持中使用
 */
// eslint-disable-next-line no-unused-vars
const transformRewards = (rewards) => {
  if (!rewards) return [];

  return rewards.map(reward => ({
    id: reward.id,
    name: reward.name,
    description: reward.description,
    effects: transformEffects(reward.effects),
    conditions: reward.conditions || null
  }));
};

/**
 * 从文件加载YAML内容
 * @param {string} filePath - YAML文件路径
 * @returns {Promise<Object>} 解析后的游戏数据
 */
export const loadYAMLFromFile = async (filePath) => {
  try {
    const response = await fetch(filePath);
    const yamlText = await response.text();
    return parseStoryYAML(yamlText);
  } catch (error) {
    console.error(`加载YAML文件失败: ${filePath}`, error);
    return null;
  }
};
