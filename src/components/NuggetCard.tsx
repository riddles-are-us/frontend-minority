import React, {useRef, useEffect, useState } from 'react';
import { createCommand } from "zkwasm-minirollup-rpc";
import { MDBCard, MDBCardBody, MDBCardHeader, MDBBtn } from 'mdb-react-ui-kit';
import { sendTransaction } from '../request';
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { AccountSlice, ConnectState } from "zkwasm-minirollup-browser";
import { selectUserState } from '../data/state';
import styled from 'styled-components';
import Loader from './Loader';

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

const INSTALL_PLAYER = 1n;
const WITHDRAW = 2n;
const DEPOSIT = 3n;
const BUY_CARD = 4n;
const CLAIM_REWARD = 5n;

export function NuggetCard(params: {index: number, amount: number}) {
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
              setTransactionComplete(true);
              // After 2 seconds, hide the loader and reset state
              setTimeout(() => {
                setIsLoading(false);
                setTransactionComplete(false);
              }, 2000);
            } else {
              setIsLoading(false);
            }
          });
    }
  }

  return (
    <StyledCard>
      <StyledCardHeader>
        <div className="d-flex">
          <h5>NuggetID: {params.index}</h5>
        </div>
      </StyledCardHeader>
      <StyledCardBody>
        <p>Holder: {params.amount}</p>
        
        {isLoading && (
          <div className="loader-container">
            <Loader />
            {transactionComplete && <span style={{marginLeft: '10px'}}>Transaction Complete!</span>}
          </div>
        )}
        
        {!isSameRound && (
          <RoundMismatchInfo>
            Round changed, buying disabled
          </RoundMismatchInfo>
        )}
        
        <StyledButton 
          onClick={() => buyCard(BigInt(params.index), 1n)} 
          disabled={isLoading || !isSameRound}
        >
          {isLoading ? 'Processing...' : isSameRound ? 'Buy More' : 'Buy'}
        </StyledButton>
      </StyledCardBody>
    </StyledCard>
  )
}
