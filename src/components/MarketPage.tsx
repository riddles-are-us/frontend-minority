import React, { useEffect, useState } from 'react';
import { MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import { selectUserState } from '../data/state';
import { AccountSlice } from "zkwasm-minirollup-browser";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import ChartPage from "../components/Chart";
import TimeRunner from "../components/TimeRunner";
import "./style.scss";
import styled from 'styled-components';

// 创建一个标题容器
const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid ${props => props.theme.primaryLight};
  padding-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    margin-top: 0.5rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.3rem;
  }
`;

// 标题文本样式
const HeaderText = styled.h3`
  color: ${props => props.theme.primary};
  font-weight: 600;
  margin: 0;
  padding-top: 5px;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
    padding-top: 3px;
  }
`;

// 调整仓鼠动画大小的容器
const RunnerHeaderContainer = styled.div`
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  margin-right: 0.2rem;
  
  .wheel-and-hamster {
    transform: scale(0.24);
    transform-origin: center;
  }
  
  @media (max-width: 576px) {
    height: 45px;
    width: 45px;
    margin-right: 0;
    
    .wheel-and-hamster {
      transform: scale(0.25);
    }
  }
`;

const InfoText = styled.p`
  color: ${props => props.theme.textSecondary};
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  
  span {
    font-weight: bold;
    color: ${props => props.theme.primary};
  }
`;

// 为Current Round添加更醒目的样式
const RoundBadge = styled.div`
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.textLight};
  font-weight: bold;
  font-size: 1.1rem;
  padding: 0.5rem 1.25rem;
  border-radius: 2rem;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  border: 1px solid ${props => props.theme.primaryDark};
  
  &::before {
    content: "•";
    display: inline-block;
    margin-right: 0.5rem;
    font-size: 1.5rem;
    line-height: 0;
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.4rem 1rem;
  }
`;

// 游戏提示样式
const GameTip = styled.div`
  background-color: ${props => props.theme.secondaryLight};
  color: ${props => props.theme.textPrimary};
  font-size: 1rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  text-align: center;
  border-left: 4px solid ${props => props.theme.secondary};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: "💡";
    display: inline-block;
    margin-right: 0.5rem;
    font-size: 1.1rem;
  }
  
  strong {
    color: ${props => props.theme.primary};
    font-weight: bold;
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
    margin: 0.5rem 0;
  }
`;

// 为Time left创建一个醒目的徽章
const TimeBadge = styled.div<{ isLow: boolean }>`
  background-color: ${props => props.isLow ? props.theme.error : props.theme.accent};
  color: ${props => props.theme.textLight};
  font-weight: bold;
  font-size: 1.1rem;
  padding: 0.5rem 1.25rem;
  border-radius: 2rem;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  border: 1px solid ${props => props.isLow ? props.theme.error : props.theme.accentDark};
  transition: background-color 0.3s ease, border-color 0.3s ease;
  
  ${props => props.isLow && `
    animation: pulseBg 1s infinite;
  `}
  
  &::before {
    content: "⏱";
    display: inline-block;
    margin-right: 0.5rem;
    font-size: 1.2rem;
  }
  
  @keyframes pulseBg {
    0% { background-color: ${props => props.theme.error}; }
    50% { background-color: ${props => `rgba(220, 53, 69, 0.7)`}; }
    100% { background-color: ${props => props.theme.error}; }
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.4rem 1rem;
  }
`;

// 创建一个容器来包含TimeBadge
const TimeContainer = styled.div`
  display: flex;
  align-items: center;
`;

// 为Time left创建一个醒目的徽章
const TimeValue = styled.span`
  font-weight: bold;
  margin: 0 0.25rem;
`;

const MarketInfo = styled.div`
  margin-bottom: 1.5rem;
  padding: 0.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 0.75rem;
    gap: 0.5rem;
  }
`;

export const MarketPage = () => {
  const userState = useAppSelector(selectUserState);

  useEffect(() => {
  }, [userState]);

  // 检查时间是否少于10秒
  const timeLeft = userState?.state ? (userState.state.counter + 1) * 5 : 0;
  const isTimeRunningLow = timeLeft < 10;

  return (
    <>
      <HeaderContainer>
        <RunnerHeaderContainer>
          <TimeRunner />
        </RunnerHeaderContainer>
        <HeaderText>Market</HeaderText>
      </HeaderContainer>
      
      {userState?.state && (
        <>
          <MarketInfo>
            <RoundBadge>
              Current Round: {userState.state.round}
            </RoundBadge>
            <TimeBadge isLow={isTimeRunningLow}>
              Time left: <TimeValue>{Math.max(0, timeLeft-5)} - {timeLeft}</TimeValue> seconds
            </TimeBadge>
          </MarketInfo>
          
          <GameTip>
            Tip: Click on the segment with the <strong>smallest non-zero number</strong> to win a share of the pool!
          </GameTip>
          
          <ChartPage />
        </>
      )}
    </>
  );
};
