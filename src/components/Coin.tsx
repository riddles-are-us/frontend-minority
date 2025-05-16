import React from 'react';
import styled from 'styled-components';

const Coin = () => {
  return (
    <StyledWrapper>
      <div className="coin">
        <span className="engraving">$</span>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .coin {
    position: relative;
    width: 40px;
    height: 40px;
    background-color: #FFA726;
    border-radius: 50%;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
    background-image: radial-gradient(
      circle at 50% 120%,
      rgba(255, 255, 255, 0.6) 0%,
      rgba(255, 215, 0, 0.1) 80%
    );
    animation: flip 2.5s infinite;
    border: 2px solid #FF9800;
  }

  .engraving {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 20px;
    font-weight: bold;
    color: #F57C00;
    text-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
  }

  @keyframes flip {
    0% {
      transform: rotateY(0deg);
    }
    50% {
      transform: rotateY(180deg);
    }
    100% {
      transform: rotateY(360deg);
    }
  }
`;

export default Coin;