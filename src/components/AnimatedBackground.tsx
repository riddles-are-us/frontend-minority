import React, { useMemo } from 'react';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
// 优先使用的字母，与游戏相关性更高的
const PRIORITY_LETTERS = 'ABCDEFGHIJK';

interface FloatingLetterProps {
  char: string;
  size: number;
  position: { x: number; y: number };
  duration: number;
  delay: number;
  isSpecial?: boolean;
  moveX: number;
  moveY: number;
}

// 简化的浮动字母组件
const FloatingLetter: React.FC<FloatingLetterProps> = ({ 
  char, 
  size, 
  position, 
  duration, 
  delay, 
  isSpecial = false,
  moveX,
  moveY
}) => {
  // 生成一个唯一的动画名称
  const animationName = `float-${Math.floor(Math.random() * 1000000)}`;
  
  // 普通字母和特殊字母采用不同的不透明度方案 - 提高不透明度
  const calculatedOpacity = isSpecial ? 0.35 : 0.15;
  
  // 颜色选择
  const colors = ['#FF9800', '#FFA726', '#FB8C00', '#F57C00'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  // 持续漂浮动画
  const keyframes = `
    @keyframes ${animationName} {
      0% { transform: translate(0, 0); }
      25% { transform: translate(${moveX * 0.25}px, ${moveY * 0.25}px); }
      50% { transform: translate(${moveX * 0.5}px, ${moveY * 0.5}px); }
      75% { transform: translate(${moveX * 0.75}px, ${moveY * 0.75}px); }
      100% { transform: translate(${moveX}px, ${moveY}px); }
    }
  `;
  
  // 样式设置
  const style: React.CSSProperties = {
    position: 'fixed',
    left: `${position.x}%`,
    top: `${position.y}%`,
    fontSize: `${size}px`,
    color: randomColor,
    opacity: calculatedOpacity,
    fontWeight: 'bold',
    fontFamily: 'Averia Serif Libre, serif',
    animation: `${animationName} ${duration}s linear infinite alternate`,
    animationDelay: `${delay}s`,
    zIndex: -1,
    pointerEvents: 'none',
    textShadow: isSpecial 
      ? '0 0 8px rgba(255, 152, 0, 0.5)' 
      : '1px 1px 2px rgba(0,0,0,0.1)',
  };
  
  return (
    <>
      <style>{keyframes}</style>
      <div style={style}>{char}</div>
    </>
  );
};

// 将屏幕分为更多区域以实现更均匀的分布
const getPositionInGrid = (index: number, totalCells: number = 16) => {
  // 将屏幕划分为4x4网格(或更多)
  const cellsPerRow = Math.sqrt(totalCells);
  const cellWidth = 100 / cellsPerRow;
  const cellHeight = 100 / cellsPerRow;
  
  // 计算此字母应该在哪个单元格内
  const cellIndex = index % totalCells;
  const row = Math.floor(cellIndex / cellsPerRow);
  const col = cellIndex % cellsPerRow;
  
  // 在单元格内随机位置
  const xOffset = Math.random() * (cellWidth * 0.8);
  const yOffset = Math.random() * (cellHeight * 0.8);
  
  // 返回最终位置百分比
  return {
    x: col * cellWidth + xOffset,
    y: row * cellHeight + yOffset
  };
};

const AnimatedBackground: React.FC = () => {
  // 使用 useMemo 确保字母只在组件首次渲染时生成一次，不会随重新渲染更新
  const letters = useMemo(() => {
    // 生成3组26个字母
    const allLetters: string[] = [];
    for(let i = 0; i < 3; i++) {
      allLetters.push(...Array.from({ length: 26 }, (_, idx) => LETTERS.charAt(idx)));
    }
    
    // 随机打乱字母顺序
    const shuffledLetters = allLetters.sort(() => Math.random() - 0.5);
    
    // 创建字母组件
    return shuffledLetters.map((char, i) => {
      // 获取网格位置
      const position = getPositionInGrid(i, 36); // 6x6网格更加分散
      
      // 生成随机移动方向和速度
      const moveX = (Math.random() * 100) - 50; // -50 到 50
      const moveY = (Math.random() * 100) - 50; // -50 到 50
      
      // 特殊字母设置
      const isSpecial = i % 26 < 3; // 每组前3个是特殊字母
      const size = isSpecial 
        ? Math.floor(Math.random() * 20) + 35 // 35-55px
        : Math.floor(Math.random() * 15) + 18; // 18-33px
      
      // 更快的动画
      const randomDuration = 3 + Math.random() * 4; // 3-7秒
      const randomDelay = Math.random() * 2;
      
      return (
        <FloatingLetter
          key={`letter-${i}`}
          char={char}
          size={size}
          position={position}
          duration={randomDuration}
          delay={randomDelay}
          isSpecial={isSpecial}
          moveX={moveX}
          moveY={moveY}
        />
      );
    });
  }, []); // 空依赖数组确保只计算一次
  
  return <div className="animated-background">{letters}</div>;
};

export default AnimatedBackground; 