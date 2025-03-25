// src/utils/yamlLoader.js
import { loadYAMLFromFile } from './yamlParser';

/**
 * 加载所有YAML剧情文件
 * @returns {Promise<Object>} 合并后的游戏数据
 */
export const loadAllStoryFiles = async () => {
  try {
    // 从memory-bank目录加载YAML文件
    const storyFiles = [
      '/memory-bank/剧情1.yaml',
      '/memory-bank/剧情2.yaml',
      '/memory-bank/剧本3.yaml',
      '/memory-bank/剧本4.yaml'
    ];
    
    // 并行加载所有YAML文件
    const storyData = await Promise.all(
      storyFiles.map(file => loadYAMLFromFile(file))
    );
    
    // 合并所有章节、变量和系统
    const mergedData = {
      chapters: [],
      variables: {},
      systems: {}
    };
    
    storyData.forEach(data => {
      if (!data) return;
      
      if (data.chapters) {
        mergedData.chapters = [...mergedData.chapters, ...data.chapters];
      }
      
      if (data.variables) {
        mergedData.variables = { ...mergedData.variables, ...data.variables };
      }
      
      if (data.systems) {
        mergedData.systems = { ...mergedData.systems, ...data.systems };
      }
    });
    
    return mergedData;
  } catch (error) {
    console.error('加载YAML剧情文件失败:', error);
    return null;
  }
};

/**
 * 将YAML文件内容转换为JSON格式并保存
 * @param {string} yamlFilePath - YAML文件路径
 * @param {string} jsonFilePath - 输出JSON文件路径
 */
export const convertYAMLToJSON = async (yamlFilePath, jsonFilePath) => {
  try {
    const data = await loadYAMLFromFile(yamlFilePath);
    if (!data) {
      console.error('YAML数据为空，无法转换');
      return false;
    }
    
    // 在浏览器环境中，我们不能直接写入文件系统
    // 这个函数主要用于开发环境，可以通过Node.js脚本执行
    console.log('转换后的JSON数据:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('转换YAML到JSON失败:', error);
    return false;
  }
};
