// src/store/playerState.js
import React, { createContext, useContext, useState } from 'react';

// 创建Context
const PlayerContext = createContext();

// 自定义Hook，便于在组件中使用玩家状态
export const usePlayerState = () => useContext(PlayerContext);

// Provider组件
export const PlayerProvider = ({ children }) => {
  const [playerState, setPlayerState] = useState({
    修为: 0,
    灵力: 100,
    因果值: 0,
    currentChapterId: 'chapter1'
  });
  
  // 更新玩家状态的函数
  const updatePlayerState = (effects) => {
    setPlayerState(prevState => {
      const newState = { ...prevState };
      
      // 应用效果
      Object.entries(effects).forEach(([key, value]) => {
        if (key in newState) {
          newState[key] += value;
        }
      });
      
      return newState;
    });
  };
  
  // 更新当前章节ID
  const updateCurrentChapter = (chapterId) => {
    setPlayerState(prevState => ({
      ...prevState,
      currentChapterId: chapterId
    }));
  };
  
  // 提供状态和操作函数
  const value = {
    playerState,
    updatePlayerState,
    updateCurrentChapter
  };
  
  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
