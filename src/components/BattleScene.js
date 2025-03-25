import React, { useState, useEffect } from 'react';
import { usePlayerState, updatePlayerState } from '../store/playerState';
import '../styles/BattleScene.css';

const BattleScene = ({ battleData, onBattleEnd }) => {
  const { playerState } = usePlayerState();
  const [currentRound, setCurrentRound] = useState(0);
  const [battleLog, setBattleLog] = useState([]);
  const [enemyStats, setEnemyStats] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [skillOptions, setSkillOptions] = useState([]);
  
  // 初始化战斗
  useEffect(() => {
    if (!battleData) return;
    
    // 设置敌人状态
    setEnemyStats({
      name: battleData.enemy.name,
      hp: battleData.enemy.hp,
      maxHp: battleData.enemy.hp,
      attack: battleData.enemy.attack,
      defense: battleData.enemy.defense,
      skills: battleData.enemy.skills || []
    });
    
    // 设置可用技能
    setSkillOptions(generateSkillOptions(playerState));
    
    // 添加战斗开始日志
    addBattleLog(`战斗开始！对手：${battleData.enemy.name}`);
  }, [battleData, playerState]);
  
  // 生成可用技能选项
  const generateSkillOptions = (playerState) => {
    const baseSkills = [
      {
        name: '普通攻击',
        damage: Math.floor(playerState.修为 * 0.8),
        cost: 0,
        description: '基础攻击'
      }
    ];
    
    // 根据玩家状态添加特殊技能
    if (playerState.剑冢共鸣 >= 30) {
      baseSkills.push({
        name: '剑气斩',
        damage: Math.floor(playerState.修为 * 1.2),
        cost: 20,
        description: '消耗灵力释放剑气'
      });
    }
    
    if (playerState.轮回井等级 >= 2) {
      baseSkills.push({
        name: '轮回之力',
        damage: Math.floor(playerState.修为 * 1.5),
        cost: 40,
        description: '借助轮回之力进行攻击'
      });
    }
    
    return baseSkills;
  };
  
  // 添加战斗日志
  const addBattleLog = (message) => {
    setBattleLog(prev => [...prev, message]);
  };
  
  // 处理玩家回合
  const handlePlayerTurn = (skill) => {
    if (battleResult) return;
    
    // 检查灵力消耗
    if (playerState.灵力 < skill.cost) {
      addBattleLog('灵力不足，无法使用此技能！');
      return;
    }
    
    // 计算伤害
    const damage = calculateDamage(skill.damage, enemyStats.defense);
    
    // 更新敌人状态
    setEnemyStats(prev => ({
      ...prev,
      hp: Math.max(0, prev.hp - damage)
    }));
    
    // 更新玩家状态
    if (skill.cost > 0) {
      updatePlayerState({ 灵力: -skill.cost });
    }
    
    // 添加战斗日志
    addBattleLog(`你使用了${skill.name}，对${enemyStats.name}造成${damage}点伤害！`);
    
    // 检查战斗是否结束
    if (enemyStats.hp - damage <= 0) {
      handleBattleEnd(true);
      return;
    }
    
    // 执行敌人回合
    setTimeout(() => handleEnemyTurn(), 1000);
  };
  
  // 处理敌人回合
  const handleEnemyTurn = () => {
    if (battleResult) return;
    
    // 选择敌人技能
    const enemySkill = selectEnemySkill();
    
    // 计算伤害
    const damage = calculateDamage(enemySkill.damage, playerState.防御 || 0);
    
    // 更新玩家状态
    updatePlayerState({ 生命: -damage });
    
    // 添加战斗日志
    addBattleLog(`${enemyStats.name}使用了${enemySkill.name}，对你造成${damage}点伤害！`);
    
    // 检查战斗是否结束
    if (playerState.生命 - damage <= 0) {
      handleBattleEnd(false);
    }
    
    setCurrentRound(prev => prev + 1);
  };
  
  // 选择敌人技能
  const selectEnemySkill = () => {
    if (!enemyStats.skills || enemyStats.skills.length === 0) {
      return {
        name: '普通攻击',
        damage: enemyStats.attack
      };
    }
    
    // 随机选择一个技能
    const availableSkills = [
      { name: '普通攻击', damage: enemyStats.attack },
      ...enemyStats.skills
    ];
    
    return availableSkills[Math.floor(Math.random() * availableSkills.length)];
  };
  
  // 计算实际伤害
  const calculateDamage = (baseDamage, defense) => {
    const damage = Math.max(1, Math.floor(baseDamage * (1 - defense / (defense + 100))));
    return Math.floor(damage * (0.9 + Math.random() * 0.2)); // 伤害浮动±10%
  };
  
  // 处理战斗结束
  const handleBattleEnd = (victory) => {
    setBattleResult(victory);
    
    if (victory) {
      // 计算奖励
      const rewards = calculateRewards(battleData.rewards, currentRound);
      
      // 更新玩家状态
      updatePlayerState(rewards);
      
      // 添加战斗日志
      addBattleLog('战斗胜利！获得奖励：');
      Object.entries(rewards).forEach(([key, value]) => {
        addBattleLog(`${key}: +${value}`);
      });
    } else {
      addBattleLog('战斗失败！');
    }
    
    // 通知父组件战斗结束
    setTimeout(() => onBattleEnd(victory), 2000);
  };
  
  // 计算战斗奖励
  const calculateRewards = (baseRewards, rounds) => {
    const rewards = { ...baseRewards };
    
    // 根据回合数调整奖励
    const multiplier = Math.max(0.5, 1 - (rounds - 3) * 0.1); // 超过3回合开始降低奖励
    
    Object.keys(rewards).forEach(key => {
      rewards[key] = Math.floor(rewards[key] * multiplier);
    });
    
    return rewards;
  };
  
  return (
    <div className="battle-scene">
      <div className="battle-header">
        <div className="player-stats">
          <h3>你的状态</h3>
          <p>生命: {playerState.生命}</p>
          <p>灵力: {playerState.灵力}</p>
          <p>修为: {playerState.修为}</p>
        </div>
        
        {enemyStats && (
          <div className="enemy-stats">
            <h3>{enemyStats.name}</h3>
            <div className="hp-bar">
              <div 
                className="hp-fill" 
                style={{ width: `${(enemyStats.hp / enemyStats.maxHp) * 100}%` }}
              />
            </div>
            <p>HP: {enemyStats.hp}/{enemyStats.maxHp}</p>
          </div>
        )}
      </div>
      
      <div className="battle-log">
        {battleLog.map((log, index) => (
          <p key={index} className="log-entry">{log}</p>
        ))}
      </div>
      
      {!battleResult && (
        <div className="skill-options">
          {skillOptions.map((skill, index) => (
            <button
              key={index}
              className="skill-button"
              onClick={() => handlePlayerTurn(skill)}
              disabled={playerState.灵力 < skill.cost}
            >
              {skill.name}
              {skill.cost > 0 && ` (灵力: ${skill.cost})`}
              <span className="skill-description">{skill.description}</span>
            </button>
          ))}
        </div>
      )}
      
      {battleResult !== null && (
        <div className={`battle-result ${battleResult ? 'victory' : 'defeat'}`}>
          <h2>{battleResult ? '战斗胜利！' : '战斗失败！'}</h2>
        </div>
      )}
    </div>
  );
};

export default BattleScene;
