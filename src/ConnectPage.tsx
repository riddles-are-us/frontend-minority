import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from './app/hooks';
import { AccountSlice } from 'zkwasm-minirollup-browser';
import { ConnectButton, LoginButton } from './components/Connect';

const Card = () => {
  // 存储每张卡片当前显示的字母
  const [letters, setLetters] = useState(Array(10).fill('A'));
  
  // 生成一个随机字母 (A-Z)
  const getRandomLetter = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return alphabet[Math.floor(Math.random() * alphabet.length)];
  };
  
  // 定时更新字母
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLetters(prevLetters => {
        // 为每张卡片生成新的随机字母
        return prevLetters.map(() => getRandomLetter());
      });
    }, 1000); // 每秒更新一次
    
    // 清理定时器
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <StyledWrapper>
      <div className="wrapper">
        <div className="inner" style={{"--quantity": 10} as any}>
          {[...Array(10)].map((_, index) => (
            <div className="card" key={index} style={{"--index": index, "--colorCard": getCardColor(index)} as any}>
              <div className="img">
                <span className="card-letter">{letters[index]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StyledWrapper>
  );
}

// 获取卡片颜色的函数
const getCardColor = (index: number) => {
  const colors = [
    '142, 249, 252', // 青绿
    '142, 252, 204', // 浅绿
    '142, 252, 157', // 嫩绿
    '215, 252, 142', // 黄绿
    '252, 252, 142', // 柠檬黄
    '252, 208, 142', // 橙黄
    '252, 142, 142', // 粉红
    '252, 142, 239', // 粉紫
    '204, 142, 252', // 紫色
    '142, 202, 252'  // 天蓝
  ];
  return colors[index];
};

const StyledWrapper = styled.div`
  width: 100%;
  height: 100%;
  
  .wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .inner {
    --w: 140px;
    --h: 190px;
    --translateZ: calc((var(--w) + var(--h)) + 0px);
    --rotateX: -15deg;
    --perspective: 1000px;
    position: absolute;
    width: var(--w);
    height: var(--h);
    top: 20%;
    left: calc(50% - (var(--w) / 2) - 2.5px);
    z-index: 2;
    transform-style: preserve-3d;
    transform: perspective(var(--perspective));
    animation: rotating 20s linear infinite; /* */
  }
  @keyframes rotating {
    from {
      transform: perspective(var(--perspective)) rotateX(var(--rotateX))
        rotateY(0);
    }
    to {
      transform: perspective(var(--perspective)) rotateX(var(--rotateX))
        rotateY(1turn);
    }
  }

  .card {
    position: absolute;
    border: 2px solid rgba(var(--colorCard));
    border-radius: 12px;
    overflow: hidden;
    inset: 0;
    transform: rotateY(calc((360deg / var(--quantity)) * var(--index)))
      translateZ(var(--translateZ));
    box-shadow: 0 0 15px rgba(var(--colorCard), 0.5);
  }

  .img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #0000
      radial-gradient(
        circle,
        rgba(var(--colorCard), 0.2) 0%,
        rgba(var(--colorCard), 0.6) 80%,
        rgba(var(--colorCard), 0.9) 100%
      );
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .card-letter {
    font-size: 70px;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    transform: translateZ(10px);
    user-select: none;
    font-family: 'Arial', sans-serif;
    transition: all 0.3s ease; /* 添加过渡效果 */
    animation: pulse 1s infinite alternate; /* 添加脉动动画 */
  }
  
  @keyframes pulse {
    from {
      text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      transform: translateZ(10px) scale(1);
    }
    to {
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(var(--colorCard), 0.6);
      transform: translateZ(10px) scale(1.05);
    }
  }
`;

const StyledLandingPage = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFF3E0 0%, #FFF8E1 100%);
  color: #212121;
  overflow: hidden;
  
  .content {
    text-align: center;
    z-index: 10;
    margin-top: 80px;
    padding: 0 20px;
  }
  
  h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    background: linear-gradient(90deg, #F57C00, #FFC107);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  }
  
  p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    max-width: 600px;
    color: #757575;
  }
  
  .buttons {
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }
  
  .card-container {
    width: 100%;
    height: 350px;
    position: relative;
    margin-bottom: -50px;
  }
  
  button {
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 30px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    min-width: 200px;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  }
  
  .connect-btn {
    background: linear-gradient(90deg, #FF9800, #FFC107);
    color: white;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }
    
    &:active {
      transform: translateY(1px);
    }
  }
  
  .login-btn {
    background: linear-gradient(90deg, #FFC107, #FFEB3B);
    color: #212121;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }
    
    &:active {
      transform: translateY(1px);
    }
  }
`;

// 修改ConnectPage组件，添加walletAlreadyConnected属性
interface ConnectPageProps {
  walletAlreadyConnected?: boolean;
}

const ConnectPage = ({ walletAlreadyConnected = false }: ConnectPageProps) => {
  const l1account = useAppSelector(AccountSlice.selectL1Account);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  const dispatch = useAppDispatch();
  
  const handleConnect = () => {
    dispatch(AccountSlice.loginL1AccountAsync());
  };
  
  const handleLogin = () => {
    if (l1account) {
      dispatch(AccountSlice.loginL2AccountAsync("ZKWASM-BEAT"));
    }
  };
  
  return (
    <StyledLandingPage>
      <div className="card-container">
        <Card />
      </div>
      
      <div className="content">
        <h1>Welcome to Minority Game</h1>
        <p>Connect your wallet and join the game to start playing. Choose wisely and may the odds be in your favor!</p>
        
        <div className="buttons">
          {!l1account ? (
            <button 
              className="connect-btn" 
              onClick={handleConnect}
            >
              {walletAlreadyConnected ? 'Reconnect Wallet' : 'Connect Wallet'}
            </button>
          ) : !l2account ? (
            <button className="login-btn" onClick={handleLogin}>
              Login to App
            </button>
          ) : (
            <p>You're connected and logged in!</p>
          )}
        </div>
      </div>
    </StyledLandingPage>
  );
};

export default ConnectPage;
