import React, { memo, useState, useEffect } from 'react';
import '../styles/EnhancedWaterInkTheme.css';

/**
 * 场景背景组件
 * 提供动态的水墨风格背景效果，根据场景类型变化
 * @param {string} type - 场景类型：'default', 'battle', 'peaceful', 'mystery', 'dark'
 * @param {boolean} animated - 是否启用动画效果
 */
const SceneBackground = memo(({ type = 'default', animated = true }) => {
  const [particles, setParticles] = useState([]);
  
  // 根据场景类型获取背景样式
  const getBackgroundStyle = () => {
    const baseStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -10,
      transition: 'all 1s ease',
    };
    
    switch (type) {
      case 'battle':
        return {
          ...baseStyle,
          backgroundColor: 'var(--paper-aged)',
          backgroundImage: `
            url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="none"/><path d="M50,50 Q100,20 150,80 T250,50 M100,150 Q150,120 200,180 T300,150 M50,250 Q100,220 150,280 T250,250" stroke="rgba(140,46,11,0.05)" fill="none" stroke-width="2"/></svg>')
          `,
          backgroundSize: '400px',
          opacity: 0.9,
        };
      case 'peaceful':
        return {
          ...baseStyle,
          backgroundColor: 'var(--paper-white)',
          backgroundImage: `
            url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="none"/><path d="M50,50 Q150,80 250,50 T400,80 M0,200 Q100,230 200,200 T350,230 M50,350 Q150,380 250,350 T400,380" stroke="rgba(0,168,107,0.03)" fill="none" stroke-width="2"/></svg>')
          `,
          backgroundSize: '400px',
          opacity: 0.8,
        };
      case 'mystery':
        return {
          ...baseStyle,
          backgroundColor: 'var(--paper-aged)',
          backgroundImage: `
            url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="none"/><path d="M30,30 Q60,90 120,60 T210,90 M60,180 Q90,240 150,210 T240,240 M30,330 Q60,390 120,360 T210,390" stroke="rgba(42,82,190,0.04)" fill="none" stroke-width="2"/></svg>')
          `,
          backgroundSize: '400px',
          opacity: 0.85,
        };
      case 'dark':
        return {
          ...baseStyle,
          backgroundColor: '#e8e0d0',
          backgroundImage: `
            url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="none"/><path d="M30,30 Q60,60 90,30 T150,60 M60,180 Q90,210 120,180 T180,210 M30,330 Q60,360 90,330 T150,360" stroke="rgba(0,0,0,0.07)" fill="none" stroke-width="2"/></svg>')
          `,
          backgroundSize: '400px',
          opacity: 0.9,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: 'var(--paper-aged)',
          backgroundImage: `
            url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="none"/><path d="M50,100 Q100,50 150,100 T250,100 M100,200 Q150,150 200,200 T300,200 M50,300 Q100,250 150,300 T250,300" stroke="rgba(0,0,0,0.03)" fill="none" stroke-width="1"/></svg>')
          `,
          backgroundSize: '400px',
          opacity: 0.8,
        };
    }
  };
  
  // 生成浮动粒子
  useEffect(() => {
    if (!animated) {
      setParticles([]);
      return;
    }
    
    // 根据场景类型确定粒子数量和颜色
    let count = 0;
    let color = 'rgba(0, 0, 0, 0.1)';
    
    switch (type) {
      case 'battle':
        count = 15;
        color = 'rgba(140, 46, 11, 0.1)';
        break;
      case 'peaceful':
        count = 10;
        color = 'rgba(0, 168, 107, 0.1)';
        break;
      case 'mystery':
        count = 20;
        color = 'rgba(42, 82, 190, 0.1)';
        break;
      case 'dark':
        count = 8;
        color = 'rgba(0, 0, 0, 0.15)';
        break;
      default:
        count = 12;
        color = 'rgba(0, 0, 0, 0.1)';
    }
    
    // 生成粒子数据
    const newParticles = Array.from({ length: count }, () => ({
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 30 + 20,
      speed: Math.random() * 20 + 10,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.1,
      color
    }));
    
    setParticles(newParticles);
  }, [type, animated]);
  
  return (
    <div style={getBackgroundStyle()}>
      {animated && particles.map(particle => (
        <div
          key={particle.id}
          className="ink-particle"
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: '50%',
            backgroundColor: particle.color,
            opacity: particle.opacity,
            animation: `float ${particle.speed}s ease-in-out infinite ${particle.delay}s`
          }}
        />
      ))}
      
      {/* 浮动动画 */}
      <style>
        {`
          @keyframes float {
            0% {
              transform: translateY(0) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(5deg);
            }
            100% {
              transform: translateY(0) rotate(0deg);
            }
          }
        `}
      </style>
    </div>
  );
});

export default SceneBackground;
