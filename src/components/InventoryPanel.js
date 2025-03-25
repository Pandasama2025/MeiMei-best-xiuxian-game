import React, { useState, useEffect } from 'react';
import { getInventory, equipItem, unequipItem, consumeItem } from '../utils/inventory';
import { usePlayerState, updatePlayerState } from '../store/playerState';
import '../styles/InventoryPanel.css';

/**
 * 背包面板组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.isOpen - 面板是否打开
 * @param {Function} props.onClose - 关闭面板的回调函数
 */
const InventoryPanel = ({ isOpen, onClose }) => {
  const [inventory, setInventory] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const { playerState } = usePlayerState();

  // 加载背包数据
  useEffect(() => {
    if (isOpen) {
      setInventory(getInventory());
    }
  }, [isOpen]);

  // 如果面板未打开或背包数据未加载，不渲染内容
  if (!isOpen || !inventory) return null;

  // 刷新背包数据
  const refreshInventory = () => {
    setInventory(getInventory());
  };

  // 处理装备物品
  const handleEquip = (itemId) => {
    if (equipItem(itemId)) {
      refreshInventory();
    }
  };

  // 处理卸下装备
  const handleUnequip = (slot) => {
    if (unequipItem(slot)) {
      refreshInventory();
    }
  };

  // 处理使用物品
  const handleUseItem = (itemId) => {
    if (consumeItem(itemId, playerState, updatePlayerState)) {
      refreshInventory();
    }
  };

  // 过滤物品
  const filteredItems = inventory.items.filter(item => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  // 计算背包使用情况
  const usedSpace = inventory.items.length;
  const totalSpace = inventory.capacity;

  // 获取物品稀有度样式
  const getRarityClass = (rarity) => {
    switch (rarity) {
      case '稀有': return 'rarity-rare';
      case '精良': return 'rarity-uncommon';
      default: return 'rarity-common';
    }
  };

  return (
    <div className="inventory-overlay">
      <div className="inventory-panel">
        <div className="inventory-header">
          <h2>背包</h2>
          <div className="inventory-capacity">
            {usedSpace}/{totalSpace}
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="inventory-tabs">
          <button 
            className={activeTab === 'all' ? 'active' : ''} 
            onClick={() => setActiveTab('all')}
          >
            全部
          </button>
          <button 
            className={activeTab === '武器' ? 'active' : ''} 
            onClick={() => setActiveTab('武器')}
          >
            武器
          </button>
          <button 
            className={activeTab === '护甲' ? 'active' : ''} 
            onClick={() => setActiveTab('护甲')}
          >
            护甲
          </button>
          <button 
            className={activeTab === '饰品' ? 'active' : ''} 
            onClick={() => setActiveTab('饰品')}
          >
            饰品
          </button>
          <button 
            className={activeTab === '法宝' ? 'active' : ''} 
            onClick={() => setActiveTab('法宝')}
          >
            法宝
          </button>
          <button 
            className={activeTab === '消耗品' ? 'active' : ''} 
            onClick={() => setActiveTab('消耗品')}
          >
            消耗品
          </button>
          <button 
            className={activeTab === '任务物品' ? 'active' : ''} 
            onClick={() => setActiveTab('任务物品')}
          >
            任务物品
          </button>
        </div>

        <div className="inventory-content">
          <div className="equipment-section">
            <h3>已装备</h3>
            <div className="equipment-slots">
              {Object.entries(inventory.equipment).map(([slot, item]) => (
                <div key={slot} className="equipment-slot">
                  <div className="slot-label">{slot}</div>
                  {item ? (
                    <div 
                      className={`equipped-item ${getRarityClass(item.rarity)}`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="item-icon">{item.icon}</div>
                      <div className="item-name">{item.name}</div>
                      <button 
                        className="unequip-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnequip(slot);
                        }}
                      >
                        卸下
                      </button>
                    </div>
                  ) : (
                    <div className="empty-slot">空</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="items-section">
            <h3>物品列表</h3>
            <div className="items-grid">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div 
                    key={`${item.id}-${item.quantity || 1}`}
                    className={`inventory-item ${getRarityClass(item.rarity)}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="item-icon">{item.icon}</div>
                    <div className="item-name">{item.name}</div>
                    {item.quantity > 1 && (
                      <div className="item-quantity">x{item.quantity}</div>
                    )}
                    {item.parts && (
                      <div className="item-parts">{item.currentParts}/{item.parts}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-items">没有物品</div>
              )}
            </div>
          </div>

          {selectedItem && (
            <div className="item-details">
              <h3>{selectedItem.name}</h3>
              <div className="item-type">{selectedItem.type}</div>
              <div className={`item-rarity ${getRarityClass(selectedItem.rarity)}`}>
                {selectedItem.rarity}
              </div>
              <p className="item-description">{selectedItem.description}</p>
              
              {selectedItem.effects && Object.keys(selectedItem.effects).length > 0 && (
                <div className="item-effects">
                  <h4>属性加成</h4>
                  <ul>
                    {Object.entries(selectedItem.effects).map(([stat, value]) => (
                      <li key={stat}>
                        {stat}: {value > 0 ? `+${value}` : value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedItem.skill && (
                <div className="item-skill">
                  <h4>技能: {selectedItem.skill.name}</h4>
                  <p>{selectedItem.skill.description}</p>
                  <div>冷却: {selectedItem.skill.cooldown}回合</div>
                  {selectedItem.skill.damage && (
                    <div>伤害: {selectedItem.skill.damage}</div>
                  )}
                </div>
              )}
              
              <div className="item-actions">
                {['武器', '护甲', '饰品', '法宝'].includes(selectedItem.type) && (
                  <button 
                    onClick={() => {
                      handleEquip(selectedItem.id);
                      setSelectedItem(null);
                    }}
                  >
                    装备
                  </button>
                )}
                
                {selectedItem.consumable && (
                  <button 
                    onClick={() => {
                      handleUseItem(selectedItem.id);
                      setSelectedItem(null);
                    }}
                  >
                    使用
                  </button>
                )}
                
                {selectedItem.readable && selectedItem.content && (
                  <button 
                    onClick={() => {
                      alert(selectedItem.content);
                    }}
                  >
                    阅读
                  </button>
                )}
                
                <button onClick={() => setSelectedItem(null)}>关闭</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;
