import React, { useEffect, useState } from 'react';
import { MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import { selectUserState } from '../data/state';
import { AccountSlice } from "zkwasm-minirollup-browser";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import ChartPage from "../components/Chart";
import TimeRunner from "../components/TimeRunner";
import "./style.scss";
import styled from 'styled-components';
import { useTheme } from 'styled-components';

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

// 为Time left创建一个醒目的徽章，根据时间范围显示不同效果
const TimeBadge = styled.div<{ timeCategory: string }>`
  color: ${props => props.theme.textLight};
  font-weight: bold;
  font-size: 1.1rem;
  padding: 0.5rem 1.25rem;
  border-radius: 2rem;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  
  /* 根据时间范围设置不同的样式 */
  /* 0-5秒: 紧急红色快速闪烁 */
  ${props => props.timeCategory === 'critical' && `
    background-color: ${props.theme.error};
    border: 1px solid ${props.theme.error};
    animation: criticalPulse 0.6s infinite;
    box-shadow: 0 0 15px ${props.theme.error}80;
    transform: scale(1.05);
    
    @keyframes criticalPulse {
      0% { background-color: ${props.theme.error}; }
      50% { background-color: rgba(220, 53, 69, 0.7); }
      100% { background-color: ${props.theme.error}; }
    }
  `}
  
  /* 5-15秒: 危险红色闪烁 */
  ${props => props.timeCategory === 'danger' && `
    background-color: ${props.theme.error};
    border: 1px solid ${props.theme.error};
    animation: dangerPulse 0.8s infinite;
    box-shadow: 0 0 10px ${props.theme.error}60;
    
    @keyframes dangerPulse {
      0% { background-color: ${props.theme.error}; }
      50% { background-color: rgba(220, 53, 69, 0.8); }
      100% { background-color: ${props.theme.error}; }
    }
  `}
  
  /* 15-30秒: 警告橙色闪烁 */
  ${props => props.timeCategory === 'warning' && `
    background-color: #fd7e14;
    border: 1px solid #fd7e14;
    animation: warningPulse 1s infinite;
    
    @keyframes warningPulse {
      0% { background-color: #fd7e14; }
      50% { background-color: rgba(253, 126, 20, 0.8); }
      100% { background-color: #fd7e14; }
    }
  `}
  
  /* 30-60秒: 注意黄色闪烁 */
  ${props => props.timeCategory === 'attention' && `
    background-color: #ffc107;
    border: 1px solid #ffc107;
    animation: attentionPulse 1.2s infinite;
    
    @keyframes attentionPulse {
      0% { background-color: #ffc107; }
      50% { background-color: rgba(255, 193, 7, 0.8); }
      100% { background-color: #ffc107; }
    }
  `}
  
  /* 60-120秒: 信息蓝色渐变 */
  ${props => props.timeCategory === 'info' && `
    background: linear-gradient(45deg, #0d6efd, #0dcaf0);
    border: 1px solid #0d6efd;
    animation: infoPulse 3s infinite;
    
    @keyframes infoPulse {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    background-size: 200% 200%;
  `}
  
  /* 120秒+: 安全绿色渐变 */
  ${props => props.timeCategory === 'safe' && `
    background: linear-gradient(45deg, #198754, #20c997);
    border: 1px solid #198754;
    animation: safePulse 5s infinite;
    
    @keyframes safePulse {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    background-size: 200% 200%;
  `}
  
  &::before {
    content: "⏱";
    display: inline-block;
    margin-right: 0.5rem;
    font-size: 1.2rem;
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
  const theme = useTheme();

  // 使用useMemo缓存计算结果，避免每次渲染都重新计算
  const { timeLeft, timeCategory } = React.useMemo(() => {
    const timeLeft = userState?.state ? (userState.state.counter + 1) * 5 : 0;
    
    // 根据时间范围确定类别
    let timeCategory = 'safe'; // 默认安全状态
    
    if (timeLeft <= 5) {
      timeCategory = 'critical'; // 0-5秒: 紧急红色快速闪烁
    } else if (timeLeft <= 15) {
      timeCategory = 'danger';   // 5-15秒: 危险红色闪烁
    } else if (timeLeft <= 30) {
      timeCategory = 'warning';  // 15-30秒: 警告橙色闪烁
    } else if (timeLeft <= 60) {
      timeCategory = 'attention'; // 30-60秒: 注意黄色闪烁
    } else if (timeLeft <= 120) {
      timeCategory = 'info';     // 60-120秒: 信息蓝色渐变
    } // 否则保持为'safe' (120秒+: 安全绿色渐变)
    
    return {
      timeLeft,
      timeCategory
    };
  }, [userState?.state?.counter]);

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
            <TimeBadge timeCategory={timeCategory}>
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
