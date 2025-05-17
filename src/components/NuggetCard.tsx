import React, {useRef, useEffect, useState } from 'react';
import { createCommand } from "zkwasm-minirollup-rpc";
import { MDBCard, MDBCardBody, MDBCardHeader, MDBBtn } from 'mdb-react-ui-kit';
import { sendTransaction } from '../request';
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { AccountSlice, ConnectState } from "zkwasm-minirollup-browser";
import { selectUserState } from '../data/state';
import styled from 'styled-components';
import Loader from './Loader';
import { SETTLE } from '../request';

const StyledCard = styled(MDBCard)`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const StyledCardHeader = styled(MDBCardHeader)`
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.textLight};
  border-bottom: none;
  
  h5 {
    margin: 0;
    font-weight: 600;
  }
`;

const StyledCardBody = styled(MDBCardBody)`
  background-color: ${props => props.theme.bgSecondary};
  
  p {
    color: ${props => props.theme.textSecondary};
    font-weight: 500;
    margin-bottom: 1rem;
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
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme.secondaryLight} !important;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
  }
  
  &:active:not(:disabled) {
    background-color: ${props => props.theme.secondaryDark} !important;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

// 为不同回合添加提示
const RoundMismatchInfo = styled.div`
  color: ${props => props.theme.error};
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  font-style: italic;
`;

// Add a styled badge for transaction complete message
const SuccessBadge = styled.div`
  background-color: ${props => props.theme.success};
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: inline-flex;
  align-items: center;
  
  &::before {
    content: "✓";
    display: inline-block;
    margin-right: 8px;
    font-weight: bold;
  }
  
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const BUY_CARD = 4n;

// 数字转字母的辅助函数
const indexToLetter = (index: number): string => {
  // 将数字转为对应的字母，0->A, 1->B, ...
  return String.fromCharCode(65 + index); // 65是ASCII中'A'的编码
};

export function NuggetCard(params: {index: number, amount: number, win: boolean}) {
  const dispatch = useAppDispatch();
  const userState = useAppSelector(selectUserState);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);

  // 检查库存回合与当前回合是否一致
  const isSameRound = userState?.player?.data.round === userState?.state?.round;

  const buyCard = (index: bigint, amount: bigint) => {
    if(userState?.player) {
        setIsLoading(true);
        const command = createCommand(BigInt(userState.player.nonce), BUY_CARD, [index, amount]);
        dispatch(sendTransaction({cmd: command, prikey: l2account!.getPrivateKey()}))
          .then((action) => {
            if (sendTransaction.fulfilled.match(action)) {
              setIsLoading(false);
              setTransactionComplete(true);
              // After 2 seconds, hide transaction complete message
              setTimeout(() => {
                setTransactionComplete(false);
              }, 2000);
            } else {
              setIsLoading(false);
            }
          });
    }
  }

  async function settle() {
    if (userState?.player?.data) {
      const isSameRound = userState?.player?.data.round === userState?.state?.round;
      if (!isSameRound) {
        const command = createCommand(BigInt(userState.player.nonce), SETTLE, []);
        dispatch(sendTransaction({
            cmd: command,
            prikey: l2account!.getPrivateKey()
        }));
      }
    }
  };


  return (
    <StyledCard>
      <StyledCardHeader>
        <div className="d-flex">
          <h5>{indexToLetter(params.index)}</h5>
        </div>
      </StyledCardHeader>
      <StyledCardBody>
        <p>Holding Number: {params.amount}</p>

        {isLoading && (
          <div className="loader-container">
            <Loader />
          </div>
        )}

        {transactionComplete && (
          <div className="loader-container">
            <SuccessBadge>Transaction Complete!</SuccessBadge>
          </div>
        )}


        {!isSameRound && (
          <RoundMismatchInfo>
            Round changed, buying disabled
          </RoundMismatchInfo>
        )}

        {!isSameRound && params.win && (
          <StyledButton 
            onClick={() => settle()} 
            >
            Win
          </StyledButton>
        )}


        {isSameRound &&
        <StyledButton 
          onClick={() => buyCard(BigInt(params.index), 1n)} 
          disabled={isLoading || !isSameRound}
        >
          {isLoading ? 'Processing...' : 'Buy More'}
        </StyledButton>
        }
      </StyledCardBody>
    </StyledCard>
  )
}
