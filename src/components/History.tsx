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

const SectionHeader = styled.h3`
  color: ${props => props.theme.primary};
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid ${props => props.theme.primaryLight};
  padding-bottom: 0.5rem;
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

  // 如果没有奖励数据，不渲染任何内容
  if (!hasUnclaimedRewards) return null;

  return (
    <>
      <SectionHeader>Unclaimed Rewards</SectionHeader>
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
    </>
  );
}
