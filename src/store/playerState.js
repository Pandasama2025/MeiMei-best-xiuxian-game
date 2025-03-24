// src/store/playerState.js
import React, { createContext, useContext, useState } from 'react';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

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
  
  // 保存游戏状态到Firestore
  const saveGame = async () => {
    try {
      const docRef = await addDoc(collection(db, "saveGames"), {
        playerState,
        timestamp: new Date().toISOString()
      });
      console.log("游戏已保存，ID: ", docRef.id);
      return docRef.id; // 返回存档ID
    } catch (error) {
      console.error("保存游戏失败: ", error);
      return null;
    }
  };
  
  // 加载最新的游戏存档
  const loadGame = async () => {
    try {
      // 获取最新的存档
      const q = query(
        collection(db, "saveGames"),
        orderBy("timestamp", "desc"),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const saveData = doc.data();
        
        // 更新玩家状态
        setPlayerState(saveData.playerState);
        console.log("游戏已加载，ID: ", doc.id);
        return true;
      } else {
        console.log("没有找到存档");
        return false;
      }
    } catch (error) {
      console.error("加载游戏失败: ", error);
      return false;
    }
  };
  
  // 提供状态和操作函数
  const value = {
    playerState,
    updatePlayerState,
    updateCurrentChapter,
    saveGame,
    loadGame
  };
  
  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
