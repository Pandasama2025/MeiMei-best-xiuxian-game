import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { usePlayerState, updatePlayerState } from '../store/playerState';
import '../styles/BattleScene.css';

const BattleScene = memo(({ battleData, onBattleEnd }) => {
  const { playerState } = usePlayerState();
  const [currentRound, setCurrentRound] = useState(0);
  const [battleLog, setBattleLog] = useState([]);
  const [enemyStats, setEnemyStats] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [skillOptions, setSkillOptions] = useState([]);
  
  // 生成可用技能选项 - 使用useMemo缓存结果
  const generateSkillOptions = useCallback((playerState) => {
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
  }, []);
  
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
  }, [battleData, playerState, generateSkillOptions]);
  
  // 添加战斗日志
  const addBattleLog = useCallback((message) => {
    setBattleLog(prev => [...prev, message]);
  }, []);
  
  // 计算实际伤害 - 使用useCallback优化
  const calculateDamage = useCallback((baseDamage, defense) => {
    const damage = Math.max(1, Math.floor(baseDamage * (1 - defense / (defense + 100))));
    return Math.floor(damage * (0.9 + Math.random() * 0.2)); // 伤害浮动±10%
  }, []);
  
  // 计算战斗奖励 - 使用useCallback优化
  const calculateRewards = useCallback((baseRewards, rounds) => {
    const rewards = { ...baseRewards };
    
    // 根据回合数调整奖励
    const multiplier = Math.max(0.5, 1 - (rounds - 3) * 0.1); // 超过3回合开始降低奖励
    
    Object.keys(rewards).forEach(key => {
      rewards[key] = Math.floor(rewards[key] * multiplier);
    });
    
    return rewards;
  }, []);
  
  // 选择敌人技能 - 使用useCallback优化
  const selectEnemySkill = useCallback(() => {
    if (!enemyStats || !enemyStats.skills || enemyStats.skills.length === 0) {
      return {
        name: '普通攻击',
        damage: enemyStats ? enemyStats.attack : 0
      };
    }
    
    // 随机选择一个技能
    const availableSkills = [
      { name: '普通攻击', damage: enemyStats.attack },
      ...enemyStats.skills
    ];
    
    return availableSkills[Math.floor(Math.random() * availableSkills.length)];
  }, [enemyStats]);
  
  // 处理战斗结束 - 使用useCallback优化
  const handleBattleEnd = useCallback((victory) => {
    setBattleResult(victory);
    
    if (victory && battleData && battleData.rewards) {
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
    setTimeout(() => onBattleEnd({
      victory,
      turns: currentRound
    }), 2000);
  }, [battleData, currentRound, calculateRewards, addBattleLog, onBattleEnd]);
  
  // 处理敌人回合 - 使用useCallback优化
  const handleEnemyTurn = useCallback(() => {
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
  }, [battleResult, selectEnemySkill, calculateDamage, playerState, enemyStats, addBattleLog, handleBattleEnd]);
  
  // 处理玩家回合 - 使用useCallback优化
  const handlePlayerTurn = useCallback((skill) => {
    if (battleResult || !enemyStats) return;
    
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
  }, [battleResult, enemyStats, playerState, calculateDamage, addBattleLog, handleBattleEnd, handleEnemyTurn]);
  
  // 使用useMemo缓存敌人血量百分比
  const enemyHpPercent = useMemo(() => {
    if (!enemyStats) return 0;
    return (enemyStats.hp / enemyStats.maxHp) * 100;
  }, [enemyStats]);
  
  return (
    <div className="battle-scene">
      <div className="battle-header">
        <div className="player-stats">
          <h3>你的状态</h3>
          <p>生命: {playerState.生命}</p>
          <p>灵力: {playerState.灵力}</p>
          <p>修为: {playerState.修为}</p>
        </div>
        
        <div className="enemy-stats">
          <h3>{enemyStats?.name || '敌人'}</h3>
          <div className="hp-bar">
            <div className="hp-bar-inner" style={{ width: `${enemyHpPercent}%` }}></div>
          </div>
          <p>生命: {enemyStats?.hp || 0} / {enemyStats?.maxHp || 0}</p>
        </div>
      </div>
      
      <div className="battle-log">
        {battleLog.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
      
      {!battleResult && (
        <div className="battle-actions">
          <h3>选择技能</h3>
          <div className="skill-buttons">
            {skillOptions.map((skill, index) => (
              <button 
                key={index}
                className="ink-button"
                onClick={() => handlePlayerTurn(skill)}
                disabled={playerState.灵力 < skill.cost}
              >
                {skill.name} ({skill.cost > 0 ? `消耗灵力${skill.cost}` : '无消耗'})
                <span className="skill-desc">{skill.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {battleResult !== null && (
        <div className="battle-result">
          <h2>{battleResult ? '战斗胜利！' : '战斗失败！'}</h2>
        </div>
      )}
    </div>
  );
});

export default BattleScene;
