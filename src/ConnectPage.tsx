import React from 'react';
import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from './app/hooks';
import { AccountSlice } from 'zkwasm-minirollup-browser';
import { ConnectButton, LoginButton } from './components/Connect';

const Card = () => {
  return (
    <StyledWrapper>
      <div className="wrapper">
        <div className="inner" style={{"--quantity": 10} as any}>
          <div className="card" style={{"--index": 0, "--colorCard": '142, 249, 252'} as any}>
            <div className="img" />
          </div>
          <div className="card" style={{"--index": 1, "--colorCard": '142, 252, 204'} as any}>
            <div className="img" />
          </div>
          <div className="card" style={{"--index": 2, "--colorCard": '142, 252, 157'} as any}>
            <div className="img" />
          </div>
          <div className="card" style={{"--index": 3, "--colorCard": '215, 252, 142'} as any}>
            <div className="img" />
          </div>
          <div className="card" style={{"--index": 4, "--colorCard": '252, 252, 142'} as any}>
            <div className="img" />
          </div>
          <div className="card" style={{"--index": 5, "--colorCard": '252, 208, 142'} as any}>
            <div className="img" />
          </div>
          <div className="card" style={{"--index": 6, "--colorCard": '252, 142, 142'} as any}>
            <div className="img" />
          </div>
          <div className="card" style={{"--index": 7, "--colorCard": '252, 142, 239'} as any}>
            <div className="img" />
          </div>
          <div className="card" style={{"--index": 8, "--colorCard": '204, 142, 252'} as any}>
            <div className="img" />
          </div>
          <div className="card" style={{"--index": 9, "--colorCard": '142, 202, 252'} as any}>
            <div className="img" />
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

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

const ConnectPage = () => {
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
            <button className="connect-btn" onClick={handleConnect}>
              Connect Wallet
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
