import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { usePlayerState } from '../store/playerState';
import '../styles/WaterInkTheme.css';

/**
 * 存档和加载界面组件 - 水墨画风格
 * 允许玩家保存当前游戏状态或加载之前的存档
 */
const SaveLoadScreen = ({ currentChapter, onClose, onLoad }) => {
  const [saveSlots, setSaveSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { playerState, setPlayerState } = usePlayerState();

  // 获取所有存档
  useEffect(() => {
    const fetchSaveSlots = async () => {
      try {
        const savesCollection = collection(db, 'saves');
        const saveSnapshot = await getDocs(savesCollection);
        const savesList = saveSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        
        // 按时间排序，最新的在前
        savesList.sort((a, b) => b.timestamp - a.timestamp);
        setSaveSlots(savesList);
      } catch (error) {
        console.error("获取存档失败:", error);
        setMessage("获取存档失败，请稍后再试");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSaveSlots();
  }, []);

  // 保存当前游戏状态
  const handleSave = async () => {
    try {
      setIsLoading(true);
      const saveData = {
        playerState: playerState,
        currentChapter: currentChapter,
        timestamp: Timestamp.now(),
        saveDate: new Date().toLocaleString()
      };
      
      await addDoc(collection(db, 'saves'), saveData);
      setMessage("游戏已成功保存");
      
      // 刷新存档列表
      const savesCollection = collection(db, 'saves');
      const saveSnapshot = await getDocs(savesCollection);
      const savesList = saveSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      
      savesList.sort((a, b) => b.timestamp - a.timestamp);
      setSaveSlots(savesList);
    } catch (error) {
      console.error("保存游戏失败:", error);
      setMessage("保存游戏失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };

  // 加载存档
  const handleLoad = async (saveId) => {
    try {
      setIsLoading(true);
      const saveDoc = doc(db, 'saves', saveId);
      const saveSnapshot = await getDoc(saveDoc);
      
      if (saveSnapshot.exists()) {
        const saveData = saveSnapshot.data();
        setPlayerState(saveData.playerState);
        onLoad(saveData.currentChapter);
        setMessage("游戏已成功加载");
        onClose();
      } else {
        setMessage("存档不存在");
      }
    } catch (error) {
      console.error("加载游戏失败:", error);
      setMessage("加载游戏失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ink-container">
      <h2 className="ink-title">游戏存档</h2>
      
      {message && (
        <div className="ink-text" style={{ color: 'var(--accent-red)' }}>
          {message}
        </div>
      )}
      
      <div className="ink-button-group">
        <button 
          className="ink-button" 
          onClick={handleSave} 
          disabled={isLoading}
        >
          保存当前游戏
        </button>
        <button 
          className="ink-button" 
          onClick={onClose}
        >
          返回游戏
        </button>
      </div>
      
      <div className="ink-scroll-area">
        {isLoading ? (
          <p className="ink-text">加载中...</p>
        ) : saveSlots.length === 0 ? (
          <p className="ink-text">暂无存档</p>
        ) : (
          saveSlots.map(save => (
            <div key={save.id} className="ink-save-item">
              <div>
                <div className="ink-save-chapter">{save.currentChapter?.title || '未知章节'}</div>
                <div className="ink-save-date">{save.saveDate}</div>
              </div>
              <button 
                className="ink-button" 
                onClick={() => handleLoad(save.id)}
              >
                加载
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SaveLoadScreen;
