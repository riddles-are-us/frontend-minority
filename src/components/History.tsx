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
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const RewardCardBody = styled(MDBCardBody)`
  background-color: ${props => props.theme.bgSecondary};
  padding: 1.25rem;
  
  p {
    color: ${props => props.theme.textSecondary};
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    
    span {
      color: ${props => props.theme.primary};
      font-weight: 600;
    }
  }
  
  .loader-container {
    display: flex;
    justify-content: center;
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
  background-color: ${props => props.theme.secondary} !important;
  color: ${props => props.theme.textPrimary} !important;
  margin-top: 1rem;
  
  &:hover {
    background-color: ${props => props.theme.secondaryLight} !important;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
  }
  
  &:active {
    background-color: ${props => props.theme.secondaryDark} !important;
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
                      <p>Round: <span>{round.round}</span></p>
                      <p>Share: <span>{round.ratio}</span></p>
                      
                      {isLoading && (
                        <div className="loader-container">
                          <Loader />
                          {isCompleted && <span style={{marginLeft: '10px'}}>Claimed!</span>}
                        </div>
                      )}
                      
                      <StyledButton 
                        onClick={() => claimReward(BigInt(round.round))}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Claim Reward'}
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
