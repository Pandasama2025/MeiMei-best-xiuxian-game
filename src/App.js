import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import './styles/WaterInkTheme.css';
import './styles/EnhancedWaterInkTheme.css';
import './styles/LoadingScreen.css';
import storyData from './data/story.json';
import Options from './components/Options';
import StatusBar from './components/StatusBar';
import EffectNotification from './components/EffectNotification';
import SceneEffects from './components/SceneEffects';
import BattleScene from './components/BattleScene';
import AchievementsPanel from './components/AchievementsPanel';
import InventoryPanel from './components/InventoryPanel';
import Cultivation from './components/Cultivation';
import AudioProvider, { useAudio } from './components/AudioManager';
import SceneBackground from './components/SceneBackground';
import AnimationEffects from './components/AnimationEffects';
import { usePlayerState, updatePlayerState, saveGame, loadGame, startNewGame } from './store/playerState';
import { loadAllStoryFiles } from './utils/yamlLoader';
import { checkAchievements, recordEnding } from './utils/achievements';
import { addItem } from './utils/inventory';
import { canStartNewGamePlus } from './utils/newGamePlus';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * 应用主内容组件
 */
function AppContent() {
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
  const [showCultivation, setShowCultivation] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const [showNewGamePlus, setShowNewGamePlus] = useState(false);
  const [newGamePlusRules, setNewGamePlusRules] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationData, setAnimationData] = useState({ type: 'transition', text: '', position: 'center' });
  const [sceneType, setSceneType] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);

  const { playBgm, playSfx, audioLoadErrors } = useAudio();

  const evaluateTriggerCondition = useCallback((condition, playerState) => {
    if (!condition) return false;

    if (typeof condition === 'string') {
      const andConditions = condition.split('&').map(c => c.trim());

      return andConditions.every(andCond => {
        const parts = andCond.match(/([^\s><!=]+)\s*([><!=]+)\s*(\d+)/);
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
      });
    }

    if (typeof condition === 'object') {
      return Object.entries(condition).every(([key, value]) => {
        if (key === 'hasUnlock' && Array.isArray(playerState.特殊解锁)) {
          if (Array.isArray(value)) {
            return value.every(unlock => playerState.特殊解锁.includes(unlock));
          } else {
            return playerState.特殊解锁.includes(value);
          }
        }

        if (key === 'notUnlock' && Array.isArray(playerState.特殊解锁)) {
          if (Array.isArray(value)) {
            return !value.some(unlock => playerState.特殊解锁.includes(unlock));
          } else {
            return !playerState.特殊解锁.includes(value);
          }
        }

        const playerValue = playerState[key] || 0;

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

        return playerValue === value;
      });
    }

    return false;
  }, []);

  const findTriggeredChapter = useCallback((chapters, playerState) => {
    if (!chapters || chapters.length === 0) return null;

    const chaptersWithTriggers = chapters.filter(c => c.trigger);

    const sortedChapters = chaptersWithTriggers.sort((a, b) => {
      const priorityA = a.triggerPriority || 0;
      const priorityB = b.triggerPriority || 0;
      return priorityB - priorityA;
    });

    for (const chapter of sortedChapters) {
      if (evaluateTriggerCondition(chapter.trigger, playerState)) {
        return chapter;
      }
    }

    return null;
  }, [evaluateTriggerCondition]);

  const currentChapterData = useMemo(() => {
    if (!gameLoaded || allChapters.length === 0) return null;

    const chapterData = allChapters.find(c => c.id === currentChapter);

    if (chapterData) {
      return chapterData;
    } else {
      const triggeredChapter = findTriggeredChapter(allChapters, playerState);

      if (triggeredChapter) {
        console.log(`触发条件章节: ${triggeredChapter.id}`);
        return triggeredChapter;
      } else {
        console.error(`找不到章节: ${currentChapter}`);
        return null;
      }
    }
  }, [currentChapter, playerState, allChapters, gameLoaded, findTriggeredChapter]);

  useEffect(() => {
    console.log('当前章节数据:', currentChapterData);
    setChapter(currentChapterData);
  }, [currentChapterData]);

  const handleOptionClick = useCallback((option) => {
    try {
      try {
        playSfx('click');
      } catch (audioError) {
        console.warn('音频点击失败:', audioError);
      }

      if (option.battle) {
        try {
          playSfx('battle_start');
          playBgm('battle');
        } catch (audioError) {
          console.warn('音频战斗失败:', audioError);
        }
        
        setAnimationData({ type: 'transition', text: option.battle.name || '战斗开始', position: 'center' });
        setShowAnimation(true);
        setSceneType('battle');
        setTimeout(() => {
          setBattleData(option.battle);
          setShowBattle(true);
          setShowAnimation(false);
        }, 1500);
        return;
      }

      if (option.effects) {
        const newState = updatePlayerState(playerState, option.effects);
        const achievements = checkAchievements(newState);
        if (achievements.length > 0) {
          setNewAchievements(achievements);
          try {
            playSfx('success');
          } catch (audioError) {
            console.warn('音频成功失败:', audioError);
          }
          setAnimationData({ type: 'achievement', text: `获得成就: ${achievements[0].title}`, position: 'top' });
          setShowAnimation(true);
          setTimeout(() => {
            setShowAnimation(false);
          }, 3000);
        }

        if (Object.keys(option.effects).length > 0) {
          setLastEffects(option.effects);
          setShowEffects(true);

          if (option.effects.生命 && option.effects.生命 > 0) {
            try {
              playSfx('heal');
            } catch (audioError) {
              console.warn('音频治疗失败:', audioError);
            }
            setAnimationData({ type: 'heal', text: `+${option.effects.生命}`, position: 'center' });
            setShowAnimation(true);
            setTimeout(() => {
              setShowAnimation(false);
            }, 1000);
          }

          if (option.effects.修为 && option.effects.修为 > 0) {
            try {
              playSfx('level_up');
            } catch (audioError) {
              console.warn('音频升级失败:', audioError);
            }
            setAnimationData({ type: 'levelUp', text: '修为提升', position: 'center' });
            setShowAnimation(true);
            setTimeout(() => {
              setShowAnimation(false);
            }, 2500);
          }

          setTimeout(() => {
            setShowEffects(false);
          }, 2000);
        }
      }

      if (option.ending) {
        recordEnding(option.ending);
        try {
          playSfx('success');
        } catch (audioError) {
          console.warn('音频成功失败:', audioError);
        }
        setAnimationData({ type: 'transition', text: '结局解锁', position: 'center' });
        setShowAnimation(true);
        setTimeout(() => {
          setShowAnimation(false);
        }, 1500);
      }

      if (option.next) {
        setAnimationData({ type: 'transition', text: '', position: 'center' });
        setShowAnimation(true);
        const nextChapter = allChapters.find(c => c.id === option.next);
        if (nextChapter) {
          if (nextChapter.tags && nextChapter.tags.includes('peaceful')) {
            setSceneType('peaceful');
            try {
              playBgm('peaceful');
            } catch (audioError) {
              console.warn('音频和平失败:', audioError);
            }
          } else if (nextChapter.tags && nextChapter.tags.includes('mystery')) {
            setSceneType('mystery');
            try {
              playBgm('mystery');
            } catch (audioError) {
              console.warn('音频神秘失败:', audioError);
            }
          } else if (nextChapter.tags && nextChapter.tags.includes('dark')) {
            setSceneType('dark');
            try {
              playBgm('mystery');
            } catch (audioError) {
              console.warn('音频黑暗失败:', audioError);
            }
          } else {
            setSceneType('default');
            try {
              playBgm('main');
            } catch (audioError) {
              console.warn('音频主失败:', audioError);
            }
          }
        }
        setTimeout(() => {
          setCurrentChapter(option.next);
          setShowAnimation(false);
          saveGame(option.next);
        }, 1500);
      }
    } catch (error) {
      console.error('处理选项点击时发生错误:', error);
    }
  }, [playerState, allChapters, playBgm, playSfx]);

  const handleBattleEnd = useCallback((result) => {
    try {
      try {
        playBgm('main');
      } catch (audioError) {
        console.warn('音频主失败:', audioError);
      }
      setSceneType('default');
      setShowBattle(false);
      setBattleData(null);

      if (result.victory) {
        try {
          playSfx('success');
        } catch (audioError) {
          console.warn('音频成功失败:', audioError);
        }
        setAnimationData({ type: 'achievement', text: '战斗胜利', position: 'center' });
        setShowAnimation(true);
        setTimeout(() => {
          setShowAnimation(false);
        }, 3000);

        if (result.rewards) {
          const newState = updatePlayerState(playerState, result.rewards);
          const achievements = checkAchievements(newState);
          if (achievements.length > 0) {
            setNewAchievements(achievements);
          }

          if (Object.keys(result.rewards).length > 0) {
            setLastEffects(result.rewards);
            setShowEffects(true);
            setTimeout(() => {
              setShowEffects(false);
            }, 2000);
          }
        }

        if (result.next) {
          setCurrentChapter(result.next);
          saveGame(result.next);
        }
      } else {
        try {
          playSfx('failure');
        } catch (audioError) {
          console.warn('音频失败失败:', audioError);
        }
        setAnimationData({ type: 'damage', text: '战斗失败', position: 'center' });
        setShowAnimation(true);
        setTimeout(() => {
          setShowAnimation(false);
        }, 1000);

        if (result.failNext) {
          setCurrentChapter(result.failNext);
          saveGame(result.failNext);
        }
      }
    } catch (error) {
      console.error('处理战斗结束时发生错误:', error);
    }
  }, [playerState, playBgm, playSfx]);

  useEffect(() => {
    const loadGameData = async () => {
      try {
        console.log('开始加载游戏数据...');
        setIsLoading(true);
        
        // 加载故事数据
        console.log('尝试加载YAML故事文件...');
        let loadedStoryData = null;
        
        try {
          loadedStoryData = await loadAllStoryFiles();
          console.log('YAML故事文件加载结果:', loadedStoryData ? '成功' : '失败');
        } catch (error) {
          console.error('加载YAML故事文件时发生错误:', error);
          loadedStoryData = null;
        }
        
        // 确保故事数据有效，如果无效则使用默认的story.json
        if (!loadedStoryData || !Array.isArray(loadedStoryData.chapters) || loadedStoryData.chapters.length === 0) {
          console.log('无法加载YAML故事数据或章节为空，使用默认的story.json');
          console.log('默认story.json章节数:', Array.isArray(storyData.chapters) ? storyData.chapters.length : 0);
          
          loadedStoryData = { 
            chapters: Array.isArray(storyData.chapters) ? storyData.chapters : [],
            variables: loadedStoryData?.variables || {},
            systems: loadedStoryData?.systems || {}
          };
        }
        
        // 设置章节数据
        if (Array.isArray(loadedStoryData.chapters)) {
          console.log(`设置 ${loadedStoryData.chapters.length} 个章节到游戏状态`);
          setAllChapters(loadedStoryData.chapters);
          
          // 输出章节ID列表以便调试
          const chapterIds = loadedStoryData.chapters.map(c => c.id).join(', ');
          console.log(`章节ID列表: ${chapterIds}`);
        } else {
          console.warn('加载的章节数据不是数组，使用默认的story.json');
          setAllChapters(Array.isArray(storyData.chapters) ? storyData.chapters : []);
        }
        
        // 初始化变量
        if (loadedStoryData.variables && typeof loadedStoryData.variables === 'object') {
          console.log('初始化游戏变量:', Object.keys(loadedStoryData.variables).join(', '));
          // 这里可以添加变量初始化逻辑
        }
        
        // 加载存档
        const savedGame = loadGame();
        if (savedGame && savedGame.chapterId) {
          console.log(`从存档加载章节: ${savedGame.chapterId}`);
          setCurrentChapter(savedGame.chapterId);
        } else {
          // 如果没有存档，使用第一个章节
          const firstChapter = loadedStoryData.chapters && loadedStoryData.chapters.length > 0 
            ? loadedStoryData.chapters[0].id 
            : 'chapter1';
          console.log(`没有存档，使用第一个章节: ${firstChapter}`);
          setCurrentChapter(firstChapter);
        }
        
        setGameLoaded(true);
        setIsLoading(false);
        console.log('游戏数据加载完成');
      } catch (error) {
        console.error('加载游戏数据失败:', error);
        // 即使出错，也尝试使用默认的story.json
        try {
          console.log('尝试使用默认的story.json作为备用方案...');
          if (Array.isArray(storyData.chapters)) {
            setAllChapters(storyData.chapters);
            setCurrentChapter('chapter1');
            setGameLoaded(true);
            setIsLoading(false);
            console.log('成功使用默认的story.json');
          } else {
            throw new Error('默认的story.json无效');
          }
        } catch (fallbackError) {
          console.error('使用默认story.json失败:', fallbackError);
          setIsLoading(false);
          setLoadingError('无法加载游戏数据，请刷新页面重试。');
        }
      }
    };

    loadGameData();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="loading-icon">🔄</div>
          <h2>正在加载修仙世界...</h2>
          <div className="loading-progress"></div>
          {loadingError && <div className="loading-error">{loadingError}</div>}
        </div>
      </div>
    );
  }

  // 确保playerState存在
  if (!playerState) {
    console.error('playerState未定义，可能是初始化问题');
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="loading-icon">⚠️</div>
          <h2>加载玩家数据时出错</h2>
          <p>无法初始化玩家状态，请刷新页面重试。</p>
          <button 
            className="ink-button" 
            onClick={() => window.location.reload()}
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App water-ink-theme">
      <SceneBackground type={sceneType} animated={true} />
      {audioLoadErrors && audioLoadErrors.length > 0 && (
        <div className="audio-status-warning">
          音频文件加载失败，请检查文件是否存在或网络连接是否正常。游戏将在无音频模式下运行
        </div>
      )}
      <AnimationEffects type={animationData.type} position={animationData.position} text={animationData.text} visible={showAnimation} onComplete={() => setShowAnimation(false)} />
      <div className="game-container">
        <StatusBar onShowAchievements={() => setShowAchievements(true)} onShowInventory={() => setShowInventory(true)} onShowCultivation={() => setShowCultivation(true)} />
        {gameLoaded && chapter ? (
          <>
            <div className="chapter-content">
              <h2>{chapter.title}</h2>
              <p>{chapter.content}</p>
            </div>
            <Options options={chapter.options} onOptionClick={handleOptionClick} playerState={playerState} />
            {showEffects && <EffectNotification effects={lastEffects} />}
            {chapter.effects && <SceneEffects effects={chapter.effects} />}
          </>
        ) : (
          <div className="loading">加载中...</div>
        )}
      </div>
      {showBattle && battleData && <BattleScene battleData={battleData} playerState={playerState} onBattleEnd={handleBattleEnd} />}
      {showAchievements && <AchievementsPanel onClose={() => setShowAchievements(false)} newAchievements={newAchievements} onClearNew={() => setNewAchievements([])} />}
      {showInventory && <InventoryPanel onClose={() => setShowInventory(false)} />}
      {showCultivation && <Cultivation onClose={() => setShowCultivation(false)} />}
      {showNewGamePlus && newGamePlusRules && (
        <div className="modal new-game-plus">
          <div className="modal-content">
            <h2>开启新的修仙之旅</h2>
            <p>你已经解锁了新的开始。在新的旅程中，你将保留:</p>
            <ul>
              {newGamePlusRules.keep.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <div className="modal-buttons">
              <button onClick={() => startNewGame(newGamePlusRules)}>开始新的旅程</button>
              <button onClick={() => setShowNewGamePlus(false)}>返回</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 带音频管理和错误边界的应用组件
 */
function AppWithAudio() {
  return (
    <ErrorBoundary>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </ErrorBoundary>
  );
}

export default AppWithAudio;
