import yaml from 'js-yaml';

/**
 * 解析YAML剧情文件
 * @param {string} content - YAML文件内容
 * @returns {Object} 解析后的剧情数据
 */
export const parseStoryYAML = (content) => {
  try {
    if (!content || typeof content !== 'string') {
      console.error('YAML内容无效:', content);
      return null;
    }

    // 预处理YAML内容，修复常见的缩进问题
    const processedContent = preprocessYAML(content);
    
    // 尝试使用js-yaml解析YAML文本
    let data;
    try {
      data = yaml.load(processedContent, {
        onWarning: (warning) => console.warn('YAML解析警告:', warning),
        schema: yaml.DEFAULT_SCHEMA,
        json: false
      });
    } catch (e) {
      console.warn('第一次YAML解析失败，尝试修复和重新解析...');
      // 尝试进一步处理格式错误
      const fixedContent = fixYAMLFormat(processedContent, e);
      data = yaml.load(fixedContent, {
        onWarning: (warning) => console.warn('YAML二次解析警告:', warning),
        schema: yaml.DEFAULT_SCHEMA,
        json: false
      });
    }
    
    if (!data) {
      console.error('YAML解析结果为空');
      return null;
    }
    
    return transformYAMLToGameFormat(data);
  } catch (error) {
    console.error('解析YAML文件失败:', error);
    console.error('错误位置:', error.mark ? `行 ${error.mark.line}, 列 ${error.mark.column}` : '未知');
    console.error('YAML内容预览:', content ? content.substring(0, 200) + '...' : '空');
    // 返回最小可用的数据结构而不是null，确保游戏能继续
    return {
      chapters: [],
      variables: {},
      systems: {},
      achievements: [],
      newGamePlus: {},
      skills: [],
      rewards: []
    };
  }
};

/**
 * 尝试修复YAML格式错误
 * @param {string} content - YAML内容
 * @param {Error} error - 解析错误
 * @returns {string} 修复后的YAML内容
 */
const fixYAMLFormat = (content, error) => {
  let lines = content.split('\n');
  
  // 如果有错误标记，集中处理该行及其上下文
  if (error && error.mark) {
    const lineNum = error.mark.line;
    if (lineNum >= 0 && lineNum < lines.length) {
      // 根据错误类型处理
      if (error.reason && error.reason.includes('mapping values')) {
        // 修复冒号后缺少空格的问题
        lines[lineNum] = lines[lineNum].replace(/(\w+):(\S)/g, '$1: $2');
      } else if (error.reason && error.reason.includes('bad indentation')) {
        // 尝试修复缩进问题
        let currentLine = lines[lineNum].trimStart();
        // 检查前一行的缩进
        if (lineNum > 0) {
          const prevLineIndent = lines[lineNum-1].length - lines[lineNum-1].trimStart().length;
          // 如果当前行看起来像是列表项
          if (currentLine.startsWith('- ')) {
            lines[lineNum] = ' '.repeat(prevLineIndent + 2) + currentLine;
          } else {
            // 否则使用相同的缩进
            lines[lineNum] = ' '.repeat(prevLineIndent) + currentLine;
          }
        }
      }
    }
  }
  
  // 全局修复：确保多个scenes节点被合并
  let fixed = lines.join('\n');
  fixed = fixed.replace(/^scenes:/gm, (match, index) => {
    return index === 0 ? match : 'more_scenes:';
  });
  
  return fixed;
};

/**
 * 预处理YAML内容，修复常见的缩进问题
 * @param {string} content - 原始YAML内容
 * @returns {string} 处理后的YAML内容
 */
const preprocessYAML = (content) => {
  try {
    // 检查内容是否为空
    if (!content || content.trim() === '') {
      console.warn('YAML内容为空');
      return content;
    }
    
    console.log('预处理YAML内容...');
    
    // 将Tab转换为空格
    let processed = content.replace(/\t/g, '  ');
    
    // 确保冒号后有空格
    processed = processed.replace(/(\w+):(\S)/g, '$1: $2');
    
    // 修复多个scenes、battle_scenes和side_scenes节点
    let isFirstScenes = true;
    let isFirstBattleScenes = true;
    let isFirstSideScenes = true;
    
    // 按行处理内容
    const lines = processed.split('\n');
    const processedLines = [];
    let prevIndent = 0;
    let prevNonEmptyIndent = 0;
    let inSequence = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trimStart();
      
      // 跳过空行和注释行
      if (trimmedLine === '' || trimmedLine.startsWith('#')) {
        processedLines.push(line);
        continue;
      }
      
      // 计算当前行的缩进
      const indent = line.length - trimmedLine.length;
      
      // 处理根级节点重复问题 (scenes:, battle_scenes:, side_scenes:)
      if (indent === 0) {
        if (trimmedLine === 'scenes:') {
          if (!isFirstScenes) {
            processedLines.push('more_scenes:');
            continue;
          }
          isFirstScenes = false;
        } else if (trimmedLine === 'battle_scenes:') {
          if (!isFirstBattleScenes) {
            processedLines.push('more_battle_scenes:');
            continue;
          }
          isFirstBattleScenes = false;
        } else if (trimmedLine === 'side_scenes:') {
          if (!isFirstSideScenes) {
            processedLines.push('more_side_scenes:');
            continue;
          }
          isFirstSideScenes = false;
        }
      }
      
      // 修复缩进问题
      if (indent === 0) {
        // 根级别节点保持不变
        prevNonEmptyIndent = 0;
      } else {
        // 非根节点，检查缩进是否合理
        if (trimmedLine.startsWith('- ')) {
          // 列表项
          if (inSequence && indent < prevNonEmptyIndent) {
            // 如果在序列中但缩进减少，使用前一个非空行的缩进
            const correctedLine = ' '.repeat(prevNonEmptyIndent) + trimmedLine;
            processedLines.push(correctedLine);
            inSequence = true;
            continue;
          }
          inSequence = true;
        } else if (indent <= prevIndent && inSequence) {
          inSequence = false;
        }
      }
      
      // 更新前一行的缩进
      prevIndent = indent;
      if (trimmedLine !== '') {
        prevNonEmptyIndent = indent;
      }
      
      processedLines.push(line);
    }
    
    return processedLines.join('\n');
  } catch (error) {
    console.error('预处理YAML内容时出错:', error);
    return content; // 出错时返回原始内容
  }
};

/**
 * 将YAML数据转换为游戏格式
 * @param {Object} yamlData - 解析后的YAML数据
 * @returns {Object} 转换后的游戏数据
 */
export const transformYAMLToGameFormat = (yamlData) => {
  try {
    console.log('开始转换YAML数据为游戏格式...');
    console.log('YAML数据结构:', Object.keys(yamlData).join(', '));
    
    // 初始化结果对象
    const result = {
      chapters: [],
      variables: yamlData.variables || {},
      systems: yamlData.systems || {},
      achievements: yamlData.achievements || [],
      newGamePlus: yamlData.newGamePlus || {},
      skills: yamlData.skills || [],
      rewards: yamlData.rewards || []
    };
    
    // 处理场景数据
    const scenes = yamlData.scenes || {};
    const battleScenes = yamlData.battle_scenes || {};
    const sideScenes = yamlData.side_scenes || {};
    
    console.log(`场景数量: 主线=${Object.keys(scenes).length}, 战斗=${Object.keys(battleScenes).length}, 支线=${Object.keys(sideScenes).length}`);
    
    // 将场景转换为章节
    const chapters = [];
    
    // 处理主线场景
    Object.entries(scenes).forEach(([sceneId, sceneData]) => {
      console.log(`处理主线场景: ${sceneId}`);
      
      const chapter = {
        id: sceneId,
        title: sceneData.name || sceneId,
        description: sceneData.description || '',
        choices: [],
        type: 'main'
      };
      
      // 处理选项
      if (Array.isArray(sceneData.options)) {
        sceneData.options.forEach((option, index) => {
          const choice = {
            id: `${sceneId}_choice${index + 1}`,
            text: option.text || `选项 ${index + 1}`,
            nextChapter: option.next || null,
            conditions: option.conditions || null,
            rewards: option.rewards || []
          };
          
          chapter.choices.push(choice);
        });
      }
      
      chapters.push(chapter);
    });
    
    // 处理战斗场景
    Object.entries(battleScenes || {}).forEach(([sceneId, sceneData]) => {
      console.log(`处理战斗场景: ${sceneId}`);
      
      const chapter = {
        id: sceneId,
        title: sceneData.name || sceneId,
        description: sceneData.description || '',
        enemies: sceneData.enemies || [],
        rewards: sceneData.rewards || [],
        nextChapter: sceneData.next || null,
        type: 'battle'
      };
      
      chapters.push(chapter);
    });
    
    // 处理支线场景
    Object.entries(sideScenes || {}).forEach(([sceneId, sceneData]) => {
      console.log(`处理支线场景: ${sceneId}`);
      
      const chapter = {
        id: sceneId,
        title: sceneData.name || sceneId,
        description: sceneData.description || '',
        choices: [],
        type: 'side',
        trigger: sceneData.trigger || null
      };
      
      // 处理选项
      if (Array.isArray(sceneData.options)) {
        sceneData.options.forEach((option, index) => {
          const choice = {
            id: `${sceneId}_choice${index + 1}`,
            text: option.text || `选项 ${index + 1}`,
            nextChapter: option.next || null,
            conditions: option.conditions || null,
            rewards: option.rewards || []
          };
          
          chapter.choices.push(choice);
        });
      }
      
      chapters.push(chapter);
    });
    
    console.log(`转换完成，总章节数: ${chapters.length}`);
    result.chapters = chapters;
    
    return result;
  } catch (error) {
    console.error('转换YAML数据为游戏格式时出错:', error);
    throw error;
  }
};

/**
 * 从文件加载YAML数据
 * @param {string} filePath - YAML文件路径
 * @returns {Promise<Object>} 转换后的游戏数据
 */
export const loadYAMLFromFile = async (filePath) => {
  try {
    console.log(`尝试加载YAML文件: ${filePath}`);
    
    // 直接使用fetch加载文件
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`无法加载文件: ${response.status} ${response.statusText}`);
    }
    
    const content = await response.text();
    
    if (!content || content.trim() === '') {
      console.error(`文件内容为空: ${filePath}`);
      return null;
    }
    
    console.log(`成功加载文件: ${filePath}, 大小: ${content.length} 字节`);
    
    // 解析YAML内容
    const data = parseStoryYAML(content);
    
    if (!data) {
      console.error(`解析文件失败: ${filePath}`);
      return null;
    }
    
    console.log(`成功解析文件: ${filePath}`);
    return data;
  } catch (error) {
    console.error(`加载YAML文件失败: ${filePath}`, error);
    
    // 如果加载失败，尝试加载.json版本
    try {
      const jsonPath = filePath.replace(/.ya?ml$/i, '.json');
      console.log(`尝试加载JSON备份: ${jsonPath}`);
      
      const response = await fetch(jsonPath);
      
      if (!response.ok) {
        throw new Error(`无法加载JSON备份: ${response.status} ${response.statusText}`);
      }
      
      const jsonData = await response.json();
      console.log(`成功加载JSON备份: ${jsonPath}`);
      
      // 转换为游戏格式
      return transformYAMLToGameFormat(jsonData);
    } catch (jsonError) {
      console.error(`加载JSON备份也失败`, jsonError);
      return null;
    }
  }
};
