import React, { useEffect, useState } from 'react';
import { createCommand } from "zkwasm-minirollup-rpc";
import { sendTransaction } from '../request';
import { MDBRow, MDBCol, MDBBtn, MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
import { selectUserState} from '../data/state';
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { AccountSlice } from "zkwasm-minirollup-browser";
import "./style.scss";
import styled from 'styled-components';
import Loader from './Loader';
import Coin from './Coin';


// 创建一个容器用于包含图标和标题
const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid ${props => props.theme.primaryLight};
  padding-bottom: 0.5rem;
`;

// 标题左侧部分
const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

// 折叠按钮样式
const CollapseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.secondary};
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  
  &:hover {
    color: ${props => props.theme.primary};
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  &:focus {
    outline: none;
  }
`;

// 标题文本样式
const HeaderText = styled.h3`
  color: ${props => props.theme.primary};
  font-weight: 600;
  margin: 0;
  padding-top: 5px;
`;

// 调整硬币大小的容器
const CoinContainer = styled.div`
  position: relative;
  height: 35px;
  width: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  margin-right: 0.2rem;
  
  .coin {
    transform: scale(0.9);
    transform-origin: center;
  }
  
  @media (max-width: 576px) {
    height: 30px;
    width: 30px;
    
    .coin {
      transform: scale(0.8);
    }
  }
`;

const RewardCard = styled(MDBCard)`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  z-index: 1;
  background: transparent;
  border: none;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 10px;
    padding: 2px;
    background: linear-gradient(135deg, #ffd700, #f5a623, #ffcc33, #ffd700);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    z-index: -1;
    box-shadow: 0 4px 15px rgba(255, 193, 7, 0.2);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 10px;
    background: ${props => props.theme.bgSecondary};
    z-index: -2;
  }
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 20px rgba(255, 193, 7, 0.2);
    
    &::before {
      background: linear-gradient(135deg, #ffd700, #FFA500, #ffcc33, #ffd700);
      box-shadow: 0 4px 20px rgba(255, 193, 7, 0.4);
      animation: borderRotate 2s linear infinite;
    }
  }
  
  @keyframes borderRotate {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

const RewardCardBody = styled(MDBCardBody)`
  background-color: transparent;
  padding: 1.5rem;
  position: relative;
  z-index: 2;
  
  p {
    color: ${props => props.theme.textSecondary};
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    span {
      color: ${props => props.theme.primary};
      font-weight: 700;
      letter-spacing: 0.5px;
    }
  }
  
  .loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px 0;
  }
`;

// Define type for button props
interface StyledButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const StyledButton = styled(MDBBtn)<StyledButtonProps>`
  background: linear-gradient(to bottom, ${props => props.theme.secondary}, ${props => props.theme.secondaryDark}) !important;
  color: ${props => props.theme.textPrimary} !important;
  margin-top: 1rem;
  border-radius: 6px;
  font-weight: 600;
  border: none;
  padding: 0.6rem 1.25rem;
  transition: all 0.3s ease;
  width: 100%;
  
  &:hover:not(:disabled) {
    background: linear-gradient(to bottom, ${props => props.theme.secondaryLight}, ${props => props.theme.secondary}) !important;
    box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3) !important;
    transform: translateY(-2px);
  }
  
  &:active:not(:disabled) {
    background: linear-gradient(to bottom, ${props => props.theme.secondaryDark}, ${props => props.theme.secondary}) !important;
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const INSTALL_PLAYER = 1n;
const WITHDRAW = 2n;
const DEPOSIT = 3n;
const BUY_CARD = 4n;
const CLAIM_REWARD = 5n;

export const HistoryPage = () => {
  const userState = useAppSelector(selectUserState);
  const dispatch = useAppDispatch();
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  const [loadingRounds, setLoadingRounds] = useState<{[key: string]: boolean}>({});
  const [completedRounds, setCompletedRounds] = useState<{[key: string]: boolean}>({});
  const [rewardsCollapsed, setRewardsCollapsed] = useState(false);

  // 检查是否有未领取的奖励
  const hasUnclaimedRewards = userState?.player?.data.rounds && 
                             Array.isArray(userState.player.data.rounds) && 
                             userState.player.data.rounds.length > 0;

  // 记录奖励数据状态
  useEffect(() => {
    if (userState?.player?.data) {
      if (hasUnclaimedRewards) {
        console.log('Unclaimed rewards available:', userState.player.data.rounds.length, 'items');
      } else {
        console.log('No unclaimed rewards available');
      }
    }
  }, [userState, hasUnclaimedRewards]);

  const claimReward = (index: bigint) => {
    if(userState?.player) {
        const roundKey = index.toString();
        // Start loading
        setLoadingRounds(prev => ({...prev, [roundKey]: true}));
        
        const command = createCommand(BigInt(userState.player.nonce), CLAIM_REWARD, [index]);
        dispatch(sendTransaction({cmd: command, prikey: l2account!.getPrivateKey()}))
        .then((action) => {
          if (sendTransaction.fulfilled.match(action)) {
            // Mark as completed
            setCompletedRounds(prev => ({...prev, [roundKey]: true}));
            // After 2 seconds, reset states
            setTimeout(() => {
              setLoadingRounds(prev => ({...prev, [roundKey]: false}));
              setCompletedRounds(prev => ({...prev, [roundKey]: false}));
            }, 2000);
          } else {
            // On failure, stop loading
            setLoadingRounds(prev => ({...prev, [roundKey]: false}));
          }
        });
    }
  }

  const toggleRewards = () => {
    setRewardsCollapsed(!rewardsCollapsed);
  };

  // 如果没有奖励数据，不渲染任何内容
  if (!hasUnclaimedRewards) return null;

  return (
    <>
      <HeaderContainer>
        <HeaderLeft>
          <CoinContainer>
            <Coin />
          </CoinContainer>
          <HeaderText>Unclaimed Rewards</HeaderText>
        </HeaderLeft>
        <CollapseButton onClick={toggleRewards}>
          {rewardsCollapsed ? '▼' : '▲'}
        </CollapseButton>
      </HeaderContainer>
      
      {!rewardsCollapsed && (
        <MDBRow>
        {
            userState!.player!.data.rounds.map((round:any) => {
              const roundKey = round.round.toString();
              const isLoading = loadingRounds[roundKey] || false;
              const isCompleted = completedRounds[roundKey] || false;
              
              return (
                <MDBCol md="3" className="mt-4" key={round.round}>
                  <RewardCard>
                    <RewardCardBody>
                      <p>Round <span>{round.round}</span></p>
                      <p>Share <span>{round.ratio}</span></p>
                      
                      {isLoading && (
                        <div className="loader-container">
                          <Loader />
                          {isCompleted && <span style={{
                            marginLeft: '10px', 
                            color: '#8BC34A', 
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                          }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '20px',
                              height: '20px',
                              backgroundColor: '#8BC34A',
                              borderRadius: '50%',
                              color: 'white',
                              fontSize: '14px',
                              marginRight: '6px'
                            }}>✓</span>
                            Claimed!
                          </span>}
                        </div>
                      )}
                      
                      <StyledButton 
                        onClick={() => claimReward(BigInt(round.round))}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'CLAIM REWARD'}
                      </StyledButton>
                    </RewardCardBody>
                  </RewardCard>
                </MDBCol>
              );
            })
        }
        </MDBRow>
      )}
    </>
  );
}
