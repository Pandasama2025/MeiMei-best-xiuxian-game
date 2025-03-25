// scripts/convertYamlToJson.js
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * 解析YAML文件并转换为游戏可用的格式
 * @param {string} yamlText - YAML文本内容
 * @returns {Object} 转换后的游戏数据
 */
const parseStoryYAML = (yamlText) => {
  try {
    const yamlData = yaml.load(yamlText);
    return transformYAMLToGameFormat(yamlData);
  } catch (error) {
    console.error('解析YAML文件失败:', error);
    return null;
  }
};

/**
 * 将YAML数据转换为游戏格式
 * @param {Object} yamlData - YAML解析后的数据
 * @returns {Object} 转换后的游戏数据
 */
const transformYAMLToGameFormat = (yamlData) => {
  const gameData = {
    variables: yamlData.variables || {},
    chapters: [],
    systems: yamlData.systems || {}
  };
  
  // 转换主线场景
  if (yamlData.scenes) {
    Object.entries(yamlData.scenes).forEach(([id, scene]) => {
      const chapter = {
        id,
        title: scene.name || id,
        text: scene.description || '',
        detailedText: scene.description ? scene.description.split('\n').filter(line => line.trim() !== '') : [],
        options: transformOptions(scene.options, id),
        assets: scene.assets || {},
        trigger: scene.trigger || null
      };
      
      gameData.chapters.push(chapter);
    });
  }
  
  // 转换战斗场景
  if (yamlData.battle_scenes) {
    Object.entries(yamlData.battle_scenes).forEach(([id, scene]) => {
      const chapter = {
        id,
        title: scene.name || id,
        text: scene.description || '',
        detailedText: scene.description ? scene.description.split('\n').filter(line => line.trim() !== '') : [],
        options: transformOptions(scene.options, id),
        assets: scene.assets || {},
        trigger: scene.trigger || null,
        isBattle: true,
        battleMechanics: scene.battle机制 || {}
      };
      
      gameData.chapters.push(chapter);
    });
  }
  
  // 转换支线场景
  if (yamlData.side_scenes) {
    Object.entries(yamlData.side_scenes).forEach(([id, scene]) => {
      const chapter = {
        id,
        title: scene.name || id,
        text: scene.description || '',
        detailedText: scene.description ? scene.description.split('\n').filter(line => line.trim() !== '') : [],
        options: transformOptions(scene.options, id),
        assets: scene.assets || {},
        trigger: scene.trigger || null,
        isSideQuest: true
      };
      
      gameData.chapters.push(chapter);
    });
  }
  
  // 转换结局
  if (yamlData.endings) {
    Object.entries(yamlData.endings).forEach(([id, ending]) => {
      const chapter = {
        id,
        title: ending.name || id,
        text: ending.description || '',
        detailedText: ending.description ? ending.description.split('\n').filter(line => line.trim() !== '') : [],
        options: transformOptions(ending.options, id),
        assets: ending.assets || {},
        trigger: ending.trigger || null,
        isEnding: true
      };
      
      gameData.chapters.push(chapter);
    });
  }
  
  return gameData;
};

/**
 * 转换选项
 * @param {Array|Object} options - 选项数据
 * @param {string} parentId - 父场景ID
 * @returns {Array} 转换后的选项数组
 */
const transformOptions = (options, parentId) => {
  if (!options) return [];
  
  // 处理数组形式的选项
  if (Array.isArray(options)) {
    return options.map((option, index) => {
      // 处理简单选项（字符串）
      if (typeof option === 'string') {
        return {
          text: option,
          nextId: `${parentId}_next_${index}`,
          effects: {}
        };
      }
      
      // 处理复杂选项（对象）
      const transformedOption = {
        text: option.text || `选项${index + 1}`,
        nextId: option.next || `${parentId}_next_${index}`,
        effects: {}
      };
      
      // 处理效果
      if (option.variables) {
        Object.entries(option.variables).forEach(([key, value]) => {
          // 解析如 "因果值+10" 的格式
          if (typeof value === 'string') {
            const match = value.match(/([^\+\-]+)([\+\-])(\d+)/);
            if (match) {
              const [, statName, operation, amount] = match;
              transformedOption.effects[statName.trim()] = operation === '+' ? 
                parseInt(amount) : -parseInt(amount);
            } else {
              transformedOption.effects[key] = value;
            }
          } else {
            transformedOption.effects[key] = value;
          }
        });
      }
      
      // 处理条件
      if (option.conditions) {
        transformedOption.conditions = option.conditions;
      }
      
      // 处理奖励
      if (option.rewards) {
        transformedOption.rewards = option.rewards;
      }
      
      return transformedOption;
    });
  }
  
  // 处理对象形式的选项
  return Object.entries(options).map(([key, option], index) => {
    return {
      text: option.text || key,
      nextId: option.next || `${parentId}_next_${index}`,
      effects: option.variables || {},
      conditions: option.conditions || null,
      rewards: option.rewards || null
    };
  });
};

/**
 * 将YAML文件转换为JSON
 * @param {string} yamlFilePath - YAML文件路径
 * @param {string} outputJsonPath - 输出JSON文件路径
 */
const convertYamlToJson = (yamlFilePath, outputJsonPath) => {
  try {
    // 读取YAML文件
    const yamlContent = fs.readFileSync(yamlFilePath, 'utf8');
    
    // 解析YAML
    const parsedData = parseStoryYAML(yamlContent);
    
    if (!parsedData) {
      console.error(`解析失败: ${yamlFilePath}`);
      return;
    }
    
    // 写入JSON文件
    fs.writeFileSync(outputJsonPath, JSON.stringify(parsedData, null, 2), 'utf8');
    console.log(`成功转换: ${yamlFilePath} -> ${outputJsonPath}`);
  } catch (error) {
    console.error(`转换失败: ${yamlFilePath}`, error);
  }
};

/**
 * 合并多个YAML文件到一个JSON文件
 * @param {Array<string>} yamlFilePaths - YAML文件路径数组
 * @param {string} outputJsonPath - 输出JSON文件路径
 */
const mergeYamlFilesToJson = (yamlFilePaths, outputJsonPath) => {
  try {
    // 合并数据
    const mergedData = {
      chapters: [],
      variables: {},
      systems: {}
    };
    
    yamlFilePaths.forEach(filePath => {
      try {
        // 读取YAML文件
        const yamlContent = fs.readFileSync(filePath, 'utf8');
        
        // 解析YAML
        const parsedData = parseStoryYAML(yamlContent);
        
        if (!parsedData) {
          console.error(`解析失败: ${filePath}`);
          return;
        }
        
        // 合并章节
        if (parsedData.chapters) {
          mergedData.chapters = [...mergedData.chapters, ...parsedData.chapters];
        }
        
        // 合并变量
        if (parsedData.variables) {
          mergedData.variables = { ...mergedData.variables, ...parsedData.variables };
        }
        
        // 合并系统
        if (parsedData.systems) {
          mergedData.systems = { ...mergedData.systems, ...parsedData.systems };
        }
        
        console.log(`成功解析: ${filePath}`);
      } catch (error) {
        console.error(`处理文件失败: ${filePath}`, error);
      }
    });
    
    // 写入合并后的JSON文件
    fs.writeFileSync(outputJsonPath, JSON.stringify(mergedData, null, 2), 'utf8');
    console.log(`成功合并到: ${outputJsonPath}`);
    
    return mergedData;
  } catch (error) {
    console.error('合并YAML文件失败:', error);
    return null;
  }
};

// 主函数
const main = () => {
  // 获取命令行参数
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法: node convertYamlToJson.js [--merge] <yamlFile1> [yamlFile2...] <outputJsonFile>');
    return;
  }
  
  // 检查是否是合并模式
  const isMergeMode = args[0] === '--merge';
  
  if (isMergeMode) {
    // 合并模式
    if (args.length < 3) {
      console.log('合并模式用法: node convertYamlToJson.js --merge <yamlFile1> [yamlFile2...] <outputJsonFile>');
      return;
    }
    
    const yamlFiles = args.slice(1, args.length - 1);
    const outputFile = args[args.length - 1];
    
    console.log('合并模式:');
    console.log('YAML文件:', yamlFiles);
    console.log('输出JSON文件:', outputFile);
    
    mergeYamlFilesToJson(yamlFiles, outputFile);
  } else {
    // 单文件模式
    if (args.length !== 2) {
      console.log('单文件模式用法: node convertYamlToJson.js <yamlFile> <outputJsonFile>');
      return;
    }
    
    const yamlFile = args[0];
    const outputFile = args[1];
    
    console.log('单文件模式:');
    console.log('YAML文件:', yamlFile);
    console.log('输出JSON文件:', outputFile);
    
    convertYamlToJson(yamlFile, outputFile);
  }
};

// 执行主函数
main();
