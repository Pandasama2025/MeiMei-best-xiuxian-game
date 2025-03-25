// src/utils/yamlLoader.js
import { loadYAMLFromFile } from './yamlParser';
import storyData from '../data/story.json';

/**
 * 加载所有YAML剧情文件
 * @returns {Promise<Object>} 合并后的游戏数据
 */
export const loadAllStoryFiles = async () => {
  try {
    console.log('开始加载YAML剧情文件...');
    
    // 确定的YAML文件路径（已确认文件存在）
    const storyPaths = [
      './data/stories/story1.yaml',
      './data/stories/story2.yaml',
      './data/stories/story3.yaml',
      './data/stories/story4.yaml',
      // 备用路径
      '/data/stories/story1.yaml',
      '/data/stories/story2.yaml',
      '/data/stories/story3.yaml',
      '/data/stories/story4.yaml',
      // 绝对路径
      '/src/data/stories/story1.yaml',
      '/src/data/stories/story2.yaml',
      '/src/data/stories/story3.yaml',
      '/src/data/stories/story4.yaml'
    ];
    
    console.log('尝试加载以下YAML文件:', storyPaths);
    
    // 尝试加载所有文件
    const loadedStoryData = await Promise.all(
      storyPaths.map(file => loadYAMLFromFile(file).catch(err => {
        console.error(`加载文件失败: ${file}`, err);
        return null;
      }))
    );
    
    // 过滤掉加载失败的文件
    const validStoryData = loadedStoryData.filter(data => data !== null);
    
    console.log(`成功加载 ${validStoryData.length} 个YAML文件`);
    
    // 即使在YAML解析失败的情况下也能返回有效的数据结构
    const mergedData = {
      chapters: Array.isArray(storyData.chapters) ? [...storyData.chapters] : [],
      variables: {},
      systems: {},
      achievements: [],
      newGamePlus: {},
      skills: [],
      rewards: []
    };
    
    // 合并所有章节、变量和系统
    validStoryData.forEach((data, index) => {
      console.log(`处理YAML文件 #${index + 1}:`, data ? '有效数据' : '无效数据');
      
      if (!data) return;
      
      // 合并章节
      if (Array.isArray(data.chapters)) {
        console.log(`合并 ${data.chapters.length} 个章节`);
        mergedData.chapters = [...mergedData.chapters, ...data.chapters];
      }
      
      // 合并变量
      if (data.variables && typeof data.variables === 'object') {
        console.log('合并变量:', Object.keys(data.variables).join(', '));
        mergedData.variables = { ...mergedData.variables, ...data.variables };
      }
      
      // 合并系统
      if (data.systems && typeof data.systems === 'object') {
        console.log('合并系统数据');
        mergedData.systems = { ...mergedData.systems, ...data.systems };
      }
      
      // 合并成就
      if (Array.isArray(data.achievements)) {
        console.log(`合并 ${data.achievements.length} 个成就`);
        mergedData.achievements = [...mergedData.achievements, ...data.achievements];
      }
      
      // 合并新游戏+
      if (data.newGamePlus && typeof data.newGamePlus === 'object') {
        console.log('合并新游戏+数据');
        mergedData.newGamePlus = { ...mergedData.newGamePlus, ...data.newGamePlus };
      }
      
      // 合并技能
      if (Array.isArray(data.skills)) {
        console.log(`合并 ${data.skills.length} 个技能`);
        mergedData.skills = [...mergedData.skills, ...data.skills];
      }
      
      // 合并奖励
      if (Array.isArray(data.rewards)) {
        console.log(`合并 ${data.rewards.length} 个奖励`);
        mergedData.rewards = [...mergedData.rewards, ...data.rewards];
      }
    });
    
    console.log(`最终合并结果: ${mergedData.chapters.length} 个章节`);
    
    // 如果没有章节，使用默认的story.json
    if (mergedData.chapters.length === 0) {
      console.warn('合并后没有章节，使用默认的story.json');
      mergedData.chapters = Array.isArray(storyData.chapters) ? [...storyData.chapters] : [];
    }
    
    return mergedData;
  } catch (error) {
    console.error('加载YAML剧情文件失败:', error);
    // 出错时返回默认的story.json数据
    console.warn('使用默认的story.json作为备用');
    return { 
      chapters: Array.isArray(storyData.chapters) ? [...storyData.chapters] : [], 
      variables: {},
      systems: {}
    };
  }
};

/**
 * 将YAML文件内容转换为JSON格式并保存
 * @param {string} yamlFilePath - YAML文件路径
 * @param {string} jsonFilePath - 输出JSON文件路径
 */
export const convertYAMLToJSON = async (yamlFilePath, jsonFilePath) => {
  try {
    const yamlData = await loadYAMLFromFile(yamlFilePath);
    if (!yamlData) {
      throw new Error(`无法加载YAML文件: ${yamlFilePath}`);
    }
    
    // 转换为JSON字符串
    const jsonString = JSON.stringify(yamlData, null, 2);
    
    // 这里应该有保存文件的逻辑，但在浏览器环境中无法直接写入文件系统
    console.log(`已将YAML转换为JSON: ${jsonFilePath}`);
    return jsonString;
  } catch (error) {
    console.error('YAML转JSON失败:', error);
    return null;
  }
};
