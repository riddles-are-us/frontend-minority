import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader">
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .loader {
    height: 30px;
    display: inline-block;
  }

  .loader > div {
    width: 10px;
    height: 10px;
    border-radius: 100%;
    box-shadow: 0 0 10px ${props => props.theme.primary};
    background: ${props => props.theme.primaryLight};
    float: left;
    margin: 5px;
    transform: scale(2);
  }

  .loader > div:nth-child(1) {
    animation: anm-BL-53-move1 1s infinite linear;
  }

  .loader > div:nth-child(2) {
    animation: anm-BL-53-move2 1s infinite linear;
    animation-delay: 0.2s;
  }

  .loader > div:nth-child(3) {
    animation: anm-BL-53-move3 1s infinite linear;
    animation-delay: 0.3s;
  }

  .loader > div:nth-child(4) {
    animation: anm-BL-53-move4 1s infinite linear;
    animation-delay: 0.4s;
  }

  .loader > div:nth-child(5) {
    animation: anm-BL-53-move5 1s infinite linear;
    animation-delay: 0.5s;
  }

  @keyframes anm-BL-53-move1 {
    50% {
      background: ${props => props.theme.secondary};
      transform: scale(1);
    }
  }

  @keyframes anm-BL-53-move2 {
    50% {
      background: ${props => props.theme.secondary};
      transform: scale(1);
    }
  }

  @keyframes anm-BL-53-move3 {
    50% {
      background: ${props => props.theme.secondary};
      transform: scale(1);
    }
  }

  @keyframes anm-BL-53-move4 {
    50% {
      background: ${props => props.theme.secondary};
      transform: scale(1);
    }
  }

  @keyframes anm-BL-53-move5 {
    50% {
      background: ${props => props.theme.secondary};
      transform: scale(1);
    }
  }
`;

export default Loader;
