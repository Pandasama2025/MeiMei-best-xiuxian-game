import React, { memo, useState, useEffect, useCallback } from 'react';
import '../styles/EnhancedWaterInkTheme.css';

/**
 * 动画效果组件
 * 提供各种游戏中需要的动画效果，如技能释放、成就获得等
 * @param {string} type - 动画类型: 'skill', 'achievement', 'levelUp', 'damage', 'heal', 'transition'
 * @param {string} position - 动画位置: 'center', 'top', 'bottom', 'left', 'right'
 * @param {string} text - 可选的显示文本
 * @param {function} onComplete - 动画完成后的回调函数
 */
const AnimationEffects = memo(({ 
  type = 'skill', 
  position = 'center', 
  text = '', 
  onComplete = () => {},
  visible = true
}) => {
  const [isActive, setIsActive] = useState(false);
  
  // 根据动画类型获取持续时间
  const getDuration = useCallback(() => {
    switch (type) {
      case 'skill': return 1200;
      case 'achievement': return 3000;
      case 'levelUp': return 2500;
      case 'damage': return 800;
      case 'heal': return 1000;
      case 'transition': return 1500;
      default: return 1000;
    }
  }, [type]);
  
  // 当visible变为true时，触发动画
  useEffect(() => {
    if (visible) {
      setIsActive(true);
      
      // 动画持续时间后，设置为非活动状态并调用完成回调
      const duration = getDuration();
      const timer = setTimeout(() => {
        setIsActive(false);
        onComplete();
      }, duration);
      
      return () => clearTimeout(timer);
    } else {
      setIsActive(false);
    }
  }, [visible, onComplete, getDuration]);
  
  // 获取位置样式
  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute',
      zIndex: 100,
    };
    
    switch (position) {
      case 'top':
        return { ...baseStyle, top: '10%', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom':
        return { ...baseStyle, bottom: '10%', left: '50%', transform: 'translateX(-50%)' };
      case 'left':
        return { ...baseStyle, left: '10%', top: '50%', transform: 'translateY(-50%)' };
      case 'right':
        return { ...baseStyle, right: '10%', top: '50%', transform: 'translateY(-50%)' };
      default: // center
        return { ...baseStyle, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };
  
  // 根据动画类型渲染不同的效果
  const renderAnimation = () => {
    if (!isActive) return null;
    
    switch (type) {
      case 'skill':
        return (
          <div className="animation-container skill-animation" style={getPositionStyle()}>
            <div className="skill-circle"></div>
            <div className="skill-wave"></div>
            {text && <div className="skill-text">{text}</div>}
          </div>
        );
        
      case 'achievement':
        return (
          <div className="animation-container achievement-animation" style={getPositionStyle()}>
            <div className="achievement-icon">🏆</div>
            <div className="achievement-glow"></div>
            {text && <div className="achievement-text">{text}</div>}
          </div>
        );
        
      case 'levelUp':
        return (
          <div className="animation-container level-up-animation" style={getPositionStyle()}>
            <div className="level-up-rays"></div>
            <div className="level-up-circle"></div>
            {text && <div className="level-up-text">{text}</div>}
          </div>
        );
        
      case 'damage':
        return (
          <div className="animation-container damage-animation" style={getPositionStyle()}>
            <div className="damage-slash"></div>
            {text && <div className="damage-text">{text}</div>}
          </div>
        );
        
      case 'heal':
        return (
          <div className="animation-container heal-animation" style={getPositionStyle()}>
            <div className="heal-particles"></div>
            {text && <div className="heal-text">{text}</div>}
          </div>
        );
        
      case 'transition':
        return (
          <div className="animation-container transition-animation" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000
          }}>
            <div className="ink-splash"></div>
            {text && <div className="transition-text">{text}</div>}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return renderAnimation();
});

export default AnimationEffects;
