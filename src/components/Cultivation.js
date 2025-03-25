// src/components/Cultivation.js
import React, { useState, useEffect } from 'react';
import { usePlayerState, updatePlayerState } from '../store/playerState';
import '../styles/Cultivation.css';

/**
 * 修炼系统界面组件
 * 允许玩家进行修炼，提升修为，并解锁技能
 */
const Cultivation = ({ isOpen, onClose }) => {
  const { playerState } = usePlayerState();
  const [cultivating, setCultivating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [cooldown, setCooldown] = useState(false);

  // 技能数据
  const skills = [
    { 
      id: 'skill1', 
      name: '引气入体', 
      description: '基础修炼技能，提高灵力恢复速度。', 
      requiredLevel: 5,
      icon: '🔄',
      effects: { 灵力: 20 }
    },
    { 
      id: 'skill2', 
      name: '剑气御风', 
      description: '御剑飞行的入门技能，可短距离腾空。', 
      requiredLevel: 20,
      icon: '🌪️',
      effects: { 修为: 5, 灵力: -15 }
    },
    { 
      id: 'skill3', 
      name: '太虚剑意', 
      description: '凝聚剑气成型，可进行远程攻击。', 
      requiredLevel: 50,
      icon: '⚔️',
      effects: { 修为: 10, 灵力: -30 }
    },
    { 
      id: 'skill4', 
      name: '天地共鸣', 
      description: '感知天地灵气，提升修炼效率。', 
      requiredLevel: 80,
      icon: '🌌',
      effects: { 修为: 15, 灵力: -10 }
    },
    { 
      id: 'skill5', 
      name: '太虚御剑真诀', 
      description: '御剑飞行的高级技能，可长时间御剑飞行。', 
      requiredLevel: 100,
      icon: '🗡️',
      effects: { 修为: 20, 灵力: -50 }
    }
  ];

  // 境界数据
  const realms = [
    { level: 1, name: '练气初期', description: '刚开始感知灵气' },
    { level: 10, name: '练气中期', description: '能够引导少量灵气入体' },
    { level: 30, name: '练气后期', description: '体内灵气开始形成小周天' },
    { level: 50, name: '筑基初期', description: '灵气在体内形成稳定循环' },
    { level: 80, name: '筑基中期', description: '灵气开始改造身体' },
    { level: 120, name: '筑基后期', description: '灵气已经完全融入身体' },
    { level: 150, name: '金丹初期', description: '丹田中形成金丹雏形' },
    { level: 200, name: '金丹中期', description: '金丹逐渐稳固' },
    { level: 250, name: '金丹后期', description: '金丹即将圆满' },
    { level: 300, name: '元婴期', description: '元婴初成，神识可离体' }
  ];

  // 获取当前境界
  const getCurrentRealm = (level) => {
    for (let i = realms.length - 1; i >= 0; i--) {
      if (level >= realms[i].level) {
        return realms[i];
      }
    }
    return realms[0];
  };

  // 获取下一个境界
  const getNextRealm = (level) => {
    for (let i = 0; i < realms.length; i++) {
      if (level < realms[i].level) {
        return realms[i];
      }
    }
    return null; // 已达最高境界
  };

  // 更新可用技能
  useEffect(() => {
    if (!isOpen) return;
    
    const currentLevel = playerState.修为 || 0;
    const unlocked = skills.filter(skill => currentLevel >= skill.requiredLevel);
    setAvailableSkills(unlocked);
  }, [isOpen, playerState.修为]);

  // 开始修炼
  const startCultivation = () => {
    if (cooldown) {
      setMessage('气息未稳，需要休息片刻才能继续修炼');
      return;
    }

    if (playerState.灵力 < 10) {
      setMessage('灵力不足，无法修炼');
      return;
    }

    setCultivating(true);
    setProgress(0);
    setMessage('正在引导灵气入体...');
    
    // 模拟修炼过程
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          completeCultivation();
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  // 完成修炼
  const completeCultivation = () => {
    setCultivating(false);
    
    // 计算修炼增益
    const currentRealm = getCurrentRealm(playerState.修为 || 0);
    const baseGain = 5;
    const realmBonus = Math.floor(currentRealm.level / 10);
    const randomFactor = Math.random() * 2 + 0.5; // 0.5 到 2.5 的随机因子
    
    const modifiedGain = Math.floor((baseGain + realmBonus) * randomFactor);
    
    // 应用修炼效果
    updatePlayerState({
      修为: modifiedGain,
      灵力: -10
    });
    
    // 检查是否突破
    const newLevel = (playerState.修为 || 0) + modifiedGain;
    const nextRealm = getNextRealm(playerState.修为 || 0);
    
    if (nextRealm && newLevel >= nextRealm.level && (playerState.修为 || 0) < nextRealm.level) {
      // 突破到新境界
      setMessage(`突破成功！你已达到【${nextRealm.name}】境界！修为+${modifiedGain}`);
      
      // 特殊解锁
      if (!playerState.特殊解锁) {
        updatePlayerState({ 特殊解锁: [] });
      }
      
      if (nextRealm.level >= 50 && !playerState.特殊解锁.includes('筑基')) {
        // 筑基特殊解锁
        const newUnlocks = [...(playerState.特殊解锁 || []), '筑基'];
        updatePlayerState({ 特殊解锁: newUnlocks });
      }
      
      if (nextRealm.level >= 150 && !playerState.特殊解锁.includes('金丹')) {
        // 金丹特殊解锁
        const newUnlocks = [...(playerState.特殊解锁 || []), '金丹'];
        updatePlayerState({ 特殊解锁: newUnlocks });
      }
    } else {
      setMessage(`修炼完成，修为+${modifiedGain}`);
    }
    
    // 设置冷却时间
    setCooldown(true);
    setTimeout(() => {
      setCooldown(false);
    }, 3000);
  };

  // 使用技能
  const useSkill = (skill) => {
    if (playerState.灵力 < Math.abs(skill.effects.灵力 || 0)) {
      setMessage(`灵力不足，无法使用【${skill.name}】`);
      return;
    }
    
    updatePlayerState(skill.effects);
    setMessage(`成功使用【${skill.name}】`);
    
    // 设置冷却时间
    setCooldown(true);
    setTimeout(() => {
      setCooldown(false);
    }, 3000);
  };

  if (!isOpen) return null;

  const currentRealm = getCurrentRealm(playerState.修为 || 0);
  const nextRealm = getNextRealm(playerState.修为 || 0);

  return (
    <div className="cultivation-overlay">
      <div className="cultivation-panel">
        <div className="cultivation-header">
          <h2>修炼系统</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="cultivation-content">
          <div className="cultivation-stats">
            <div className="stat-item">
              <span className="stat-label">当前境界：</span>
              <span className="stat-value">{currentRealm.name}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">修为：</span>
              <span className="stat-value">{playerState.修为 || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">灵力：</span>
              <span className="stat-value">{playerState.灵力 || 0}</span>
            </div>
            
            {nextRealm && (
              <div className="next-realm">
                <span>距离【{nextRealm.name}】还需：</span>
                <span>{nextRealm.level - (playerState.修为 || 0)} 修为</span>
              </div>
            )}
          </div>
          
          <div className="cultivation-action">
            <h3>修炼</h3>
            <p>{currentRealm.description}</p>
            
            {cultivating ? (
              <div className="cultivation-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <p>修炼中... {progress}%</p>
              </div>
            ) : (
              <button 
                className={`cultivation-button ${cooldown ? 'cooldown' : ''}`}
                onClick={startCultivation}
                disabled={cooldown}
              >
                {cooldown ? '调息中...' : '开始修炼'}
              </button>
            )}
            
            {message && <div className="cultivation-message">{message}</div>}
          </div>
          
          <div className="cultivation-skills">
            <h3>可用技能</h3>
            {availableSkills.length > 0 ? (
              <div className="skills-list">
                {availableSkills.map(skill => (
                  <div key={skill.id} className="skill-item">
                    <div className="skill-icon">{skill.icon}</div>
                    <div className="skill-info">
                      <h4>{skill.name}</h4>
                      <p>{skill.description}</p>
                      <div className="skill-effects">
                        {Object.entries(skill.effects).map(([key, value]) => (
                          <span key={key} className={value >= 0 ? 'positive' : 'negative'}>
                            {key}: {value > 0 ? '+' : ''}{value}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button 
                      className="use-skill-button"
                      onClick={() => useSkill(skill)}
                      disabled={cooldown || (playerState.灵力 < Math.abs(skill.effects.灵力 || 0))}
                    >
                      使用
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-skills">修为不足，尚未解锁任何技能</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cultivation;
