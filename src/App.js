import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import './styles/WaterInkTheme.css';
import storyData from './data/story.json';
import Options from './components/Options';
import StatusBar from './components/StatusBar';
import EffectNotification from './components/EffectNotification';
import SceneEffects from './components/SceneEffects';
import BattleScene from './components/BattleScene';
import AchievementsPanel from './components/AchievementsPanel';
import InventoryPanel from './components/InventoryPanel';
import { usePlayerState, updatePlayerState, saveGame, loadGame, startNewGame } from './store/playerState';
import { loadAllStoryFiles } from './utils/yamlLoader';
import { checkAchievements, recordEnding } from './utils/achievements';
import { addItem } from './utils/inventory';
import { canStartNewGamePlus } from './utils/newGamePlus';

function App() {
  const [currentChapter, setCurrentChapter] = useState('chapter1');
  const [chapter, setChapter] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const { playerState } = usePlayerState();
  const [showEffects, setShowEffects] = useState(false);
  const [lastEffects, setLastEffects] = useState({});
  const [karmaClass, setKarmaClass] = useState('');
  const [gameLoaded, setGameLoaded] = useState(false);
  const [battleData, setBattleData] = useState(null);
  const [showBattle, setShowBattle] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const [showNewGamePlus, setShowNewGamePlus] = useState(false);
  const [newGamePlusRules, setNewGamePlusRules] = useState(null);

  /**
   * 评估触发条件
   * @param {string|Object} condition - 触发条件
   * @param {Object} playerState - 玩家状态
   * @returns {boolean} 条件是否满足
   */
  const evaluateTriggerCondition = useCallback((condition, playerState) => {
    if (!condition) return false;
    
    // 处理字符串条件（如 "因果值 > 10 & 执念值 < 50"）
    if (typeof condition === 'string') {
      // 分割AND条件
      const andConditions = condition.split('&').map(c => c.trim());
      
      // 所有AND条件都必须满足
      return andConditions.every(andCond => {
        // 分割条件部分
        const parts = andCond.match(/([^\s><!=]+)\s*([><!=]+)\s*(\d+)/);
        if (!parts) return false;
        
        const [, statName, operator, valueStr] = parts;
        const statValue = playerState[statName] || 0;
        const compareValue = parseInt(valueStr, 10);
        
        // 根据运算符比较值
        switch (operator) {
          case '>': return statValue > compareValue;
          case '<': return statValue < compareValue;
          case '>=': return statValue >= compareValue;
          case '<=': return statValue <= compareValue;
          case '==': return statValue === compareValue;
          case '!=': return statValue !== compareValue;
          default: return false;
        }
      });
    }
    
    // 处理对象条件
    if (typeof condition === 'object') {
      // 检查每个属性条件
      return Object.entries(condition).every(([key, value]) => {
        // 特殊条件：拥有特定解锁
        if (key === 'hasUnlock' && Array.isArray(playerState.特殊解锁)) {
          if (Array.isArray(value)) {
            // 必须拥有所有指定的解锁
            return value.every(unlock => playerState.特殊解锁.includes(unlock));
          } else {
            // 必须拥有指定的解锁
            return playerState.特殊解锁.includes(value);
          }
        }
        
        // 特殊条件：不拥有特定解锁
        if (key === 'notUnlock' && Array.isArray(playerState.特殊解锁)) {
          if (Array.isArray(value)) {
            // 不能拥有任何指定的解锁
            return !value.some(unlock => playerState.特殊解锁.includes(unlock));
          } else {
            // 不能拥有指定的解锁
            return !playerState.特殊解锁.includes(value);
          }
        }
        
        // 普通属性比较
        const playerValue = playerState[key] || 0;
        
        // 如果值是对象，检查比较运算符
        if (typeof value === 'object' && !Array.isArray(value)) {
          return Object.entries(value).every(([op, compareValue]) => {
            switch (op) {
              case 'gt': return playerValue > compareValue;
              case 'lt': return playerValue < compareValue;
              case 'gte': return playerValue >= compareValue;
              case 'lte': return playerValue <= compareValue;
              case 'eq': return playerValue === compareValue;
              case 'neq': return playerValue !== compareValue;
              default: return false;
            }
          });
        }
        
        // 简单相等比较
        return playerValue === value;
      });
    }
    
    return false;
  }, []);

  /**
   * 查找满足触发条件的章节
   * @param {Array} chapters - 所有章节数据
   * @param {Object} playerState - 玩家状态
   * @returns {Object|null} 满足条件的章节或null
   */
  const findTriggeredChapter = useCallback((chapters, playerState) => {
    if (!chapters || chapters.length === 0) return null;
    
    // 查找所有带有触发条件的章节
    const chaptersWithTriggers = chapters.filter(c => c.trigger);
    
    // 按优先级排序（如果有优先级字段）
    const sortedChapters = chaptersWithTriggers.sort((a, b) => {
      const priorityA = a.triggerPriority || 0;
      const priorityB = b.triggerPriority || 0;
      return priorityB - priorityA; // 高优先级在前
    });
    
    // 检查每个章节的触发条件
    for (const chapter of sortedChapters) {
      if (evaluateTriggerCondition(chapter.trigger, playerState)) {
        return chapter;
      }
    }
    
    return null;
  }, [evaluateTriggerCondition]);

  // 初始化游戏数据
  useEffect(() => {
    const initGameData = async () => {
      try {
        // 尝试加载YAML剧情文件
        const yamlStoryData = await loadAllStoryFiles();
        
        if (yamlStoryData && yamlStoryData.chapters && yamlStoryData.chapters.length > 0) {
          console.log('成功加载YAML剧情文件');
          setAllChapters(yamlStoryData.chapters);
          
          // 保存多周目规则
          if (yamlStoryData.newGamePlus) {
            setNewGamePlusRules(yamlStoryData.newGamePlus);
          }
        } else {
          console.log('使用默认JSON剧情文件');
          setAllChapters(storyData.chapters);
        }
        
        // 尝试加载存档
        const savedChapterId = loadGame();
        if (savedChapterId) {
          setCurrentChapter(savedChapterId);
        }
        
        setGameLoaded(true);
      } catch (error) {
        console.error('初始化游戏数据失败:', error);
        // 使用默认JSON剧情文件作为备选
        setAllChapters(storyData.chapters);
        setGameLoaded(true);
      }
    };
    
    initGameData();
  }, []);

  // 加载章节数据
  useEffect(() => {
    if (!gameLoaded || allChapters.length === 0) return;
    
    // 查找当前章节
    const chapterData = allChapters.find(c => c.id === currentChapter);
    
    if (chapterData) {
      setChapter(chapterData);
      
      // 检查成就
      const newUnlocked = checkAchievements(playerState, currentChapter);
      if (newUnlocked.length > 0) {
        setNewAchievements(newUnlocked);
        setTimeout(() => setNewAchievements([]), 5000); // 5秒后清除通知
      }
      
      // 检查章节奖励物品
      if (chapterData.rewards && chapterData.rewards.items) {
        chapterData.rewards.items.forEach(item => {
          addItem(item.id, item.quantity || 1);
        });
      }
    } else {
      // 如果找不到指定章节，检查是否有满足触发条件的章节
      const triggeredChapter = findTriggeredChapter(allChapters, playerState);
      
      if (triggeredChapter) {
        console.log(`触发条件章节: ${triggeredChapter.id}`);
        setCurrentChapter(triggeredChapter.id);
        setChapter(triggeredChapter);
      } else {
        console.error(`找不到章节: ${currentChapter}`);
      }
    }
    
    // 根据因果值设置特殊效果样式
    if (playerState.因果值 >= 50) {
      setKarmaClass('karma-high');
    } else if (playerState.因果值 <= -50) {
      setKarmaClass('karma-low');
    } else {
      setKarmaClass('');
    }
    
    // 检查是否是结局章节
    if (chapterData && chapterData.isEnding) {
      // 记录结局
      recordEnding(chapterData.id);
      
      // 检查是否可以开始新周目
      if (newGamePlusRules && canStartNewGamePlus(playerState, newGamePlusRules)) {
        setShowNewGamePlus(true);
      }
    }
  }, [currentChapter, playerState, allChapters, gameLoaded, newGamePlusRules, findTriggeredChapter]);

  /**
   * 处理选项点击
   * @param {Object} option - 选项数据
   */
  const handleOptionClick = (option) => {
    // 应用效果
    if (option.effects) {
      setLastEffects(option.effects);
      setShowEffects(true);
      updatePlayerState(option.effects);
      
      // 3秒后隐藏效果通知
      setTimeout(() => {
        setShowEffects(false);
      }, 3000);
    }
    
    // 检查是否有战斗
    if (option.battle) {
      setBattleData(option.battle);
      setShowBattle(true);
      return;
    }
    
    // 转到下一章节
    if (option.nextId) {
      setCurrentChapter(option.nextId);
      saveGame(option.nextId, playerState);
    }
  };

  /**
   * 处理战斗结束
   * @param {Object} result - 战斗结果
   */
  const handleBattleEnd = (result) => {
    setShowBattle(false);
    
    // 检查战斗成就
    const newUnlocked = checkAchievements(playerState, null, {
      victory: result.victory,
      turns: result.turns
    });
    
    if (newUnlocked.length > 0) {
      setNewAchievements(newUnlocked);
      setTimeout(() => setNewAchievements([]), 5000);
    }
    
    // 应用战斗奖励
    if (result.victory && battleData.rewards) {
      // 属性奖励
      if (battleData.rewards.stats) {
        updatePlayerState(battleData.rewards.stats);
      }
      
      // 物品奖励
      if (battleData.rewards.items) {
        battleData.rewards.items.forEach(item => {
          addItem(item.id, item.quantity || 1);
        });
      }
    }
    
    // 转到相应的下一章节
    const nextId = result.victory ? 
      (battleData.nextIdOnVictory || currentChapter) : 
      (battleData.nextIdOnDefeat || currentChapter);
    
    setCurrentChapter(nextId);
    saveGame(nextId, playerState);
    setBattleData(null);
  };

  /**
   * 处理开始新周目
   */
  const handleStartNewGamePlus = () => {
    if (newGamePlusRules) {
      startNewGame(newGamePlusRules);
      setCurrentChapter('chapter1');
      setShowNewGamePlus(false);
    }
  };

  // 渲染加载中状态
  if (!gameLoaded || !chapter) {
    return <div className="loading">加载中...</div>;
  }

  // 渲染战斗场景
  if (showBattle && battleData) {
    return (
      <BattleScene 
        battleData={battleData}
        playerState={playerState}
        onBattleEnd={handleBattleEnd}
      />
    );
  }

  return (
    <div className={`app ${karmaClass}`}>
      {/* 顶部状态栏 */}
      <StatusBar 
        playerState={playerState}
        onShowAchievements={() => setShowAchievements(true)}
        onShowInventory={() => setShowInventory(true)}
      />
      
      {/* 主要内容区域 */}
      <div className="game-container">
        <SceneEffects chapter={chapter} />
        
        <div className="chapter-content">
          <h2>{chapter.title}</h2>
          <div className="chapter-text">{chapter.text}</div>
          
          {/* 选项区域 */}
          <Options 
            options={chapter.options} 
            playerState={playerState}
            onOptionClick={handleOptionClick}
          />
        </div>
      </div>
      
      {/* 效果通知 */}
      {showEffects && (
        <EffectNotification effects={lastEffects} />
      )}
      
      {/* 成就通知 */}
      {newAchievements.length > 0 && (
        <div className="achievement-notification">
          {newAchievements.map((achievement, index) => (
            <div key={index} className="achievement-alert">
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-info">
                <h3>解锁成就: {achievement.title}</h3>
                <p>{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 成就面板 */}
      <AchievementsPanel 
        isOpen={showAchievements} 
        onClose={() => setShowAchievements(false)} 
      />
      
      {/* 背包面板 */}
      <InventoryPanel 
        isOpen={showInventory} 
        onClose={() => setShowInventory(false)} 
      />
      
      {/* 新周目提示 */}
      {showNewGamePlus && (
        <div className="new-game-plus-overlay">
          <div className="new-game-plus-dialog">
            <h2>完成结局</h2>
            <p>恭喜你完成了一个游戏结局！</p>
            <p>你现在可以开始新的周目，并保留部分进度。</p>
            <div className="new-game-plus-buttons">
              <button onClick={handleStartNewGamePlus}>开始新周目</button>
              <button onClick={() => setShowNewGamePlus(false)}>继续当前游戏</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
