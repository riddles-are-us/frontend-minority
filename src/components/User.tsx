import React, {useRef, useEffect, useState } from 'react';
import {  MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardHeader, MDBBtn } from 'mdb-react-ui-kit';
import { selectUserState } from '../data/state';
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { NuggetCard } from "../components/NuggetCard";
import { WithdrawModal } from "../components/Common";
import { setUIState, ModalIndicator, selectUIState } from "../data/ui";
import Record from "./Record";
import styled from 'styled-components';

// Profile Card
const ProfileCard = styled(MDBCard)`
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  margin-bottom: 2rem;
  border: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
  }
`;

const ProfileCardHeader = styled(MDBCardHeader)`
  background: linear-gradient(135deg, ${props => props.theme.primary} 0%, ${props => props.theme.primaryDark} 100%);
  color: ${props => props.theme.textLight};
  border-bottom: none;
  padding: 1.25rem 1.5rem;
  
  h5 {
    margin: 0;
    font-weight: 700;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    
    &:before {
      content: "👤";
      margin-right: 10px;
      font-size: 1.4rem;
    }
  }
`;

const ProfileCardBody = styled(MDBCardBody)`
  background-color: ${props => props.theme.bgSecondary};
  padding: 1.5rem;
`;

// Balance display
const BalanceDisplay = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  border-left: 4px solid ${props => props.theme.primary};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const BalanceLabel = styled.span`
  color: ${props => props.theme.textSecondary};
  font-weight: 500;
  font-size: 1.1rem;
  margin-right: 10px;
`;

const BalanceValue = styled.span`
  color: ${props => props.theme.primary};
  font-weight: 700;
  font-size: 1.5rem;
  position: relative;
  
  &:after {
    content: "💰";
    position: absolute;
    font-size: 1.2rem;
    margin-left: 8px;
    top: 0;
  }
`;

// Button container
const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// Define type for button props
interface StyledButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant: 'withdraw' | 'deposit';
}

// Styled action buttons
const ActionButton = styled(MDBBtn)<StyledButtonProps>`
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  background-color: ${props => 
    props.variant === 'withdraw' 
      ? props.theme.error + '20' 
      : props.theme.success + '20'
  } !important;
  
  color: ${props => 
    props.variant === 'withdraw' 
      ? props.theme.error 
      : props.theme.success
  } !important;
  
  border: 1px solid ${props => 
    props.variant === 'withdraw' 
      ? props.theme.error 
      : props.theme.success
  } !important;
  
  &:before {
    content: "${props => props.variant === 'withdraw' ? '↑' : '↓'}";
    margin-right: 8px;
    font-size: 1.1rem;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
    background-color: ${props => 
      props.variant === 'withdraw' 
        ? props.theme.error + '30'
        : props.theme.success + '30'
    } !important;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 0.7rem 1rem;
  }
`;

// Inventory section
const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid ${props => props.theme.primaryLight};
  padding-bottom: 0.5rem;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

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

const HeaderText = styled.h3`
  color: ${props => props.theme.primary};
  font-weight: 600;
  margin: 0;
  padding-top: 5px;
`;

const RecordContainer = styled.div`
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-right: 0.2rem;
  
  svg {
    transform: scale(0.18);
    transform-origin: center;
  }
  
  @media (max-width: 576px) {
    height: 35px;
    width: 35px;
    
    svg {
      transform: scale(0.16);
    }
  }
`;

// Round badges
const RoundInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.2rem 0;
  flex-wrap: wrap;
  gap: 0.8rem;
`;

const FromRoundBadge = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.secondary} 0%, ${props => props.theme.secondaryDark} 100%);
  color: ${props => props.theme.textLight};
  font-weight: bold;
  font-size: 0.9rem;
  padding: 0.35rem 0.9rem;
  border-radius: 1rem;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  
  &::before {
    content: "•";
    display: inline-block;
    margin-right: 0.5rem;
    font-size: 1.5rem;
    line-height: 0;
    animation: pulse 1s infinite;
  }
`;

const RoundBadge = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.primary} 0%, ${props => props.theme.primaryDark} 100%);
  color: ${props => props.theme.textLight};
  font-weight: bold;
  font-size: 0.9rem;
  padding: 0.35rem 0.9rem;
  border-radius: 1rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  
  &::before {
    content: "•";
    display: inline-block;
    margin-right: 0.5rem;
    font-size: 1.5rem;
    line-height: 0;
    animation: pulse 1s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }
`;

// Empty inventory message
const EmptyInventory = styled.div`
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  margin: 1rem 0;
  color: ${props => props.theme.textSecondary};
  font-size: 1.1rem;
  
  &:before {
    content: "📦";
    display: block;
    font-size: 2.5rem;
    margin-bottom: 1rem;
    opacity: 0.7;
  }
`;

export const User = () => {
  const userState = useAppSelector(selectUserState);
  const uiState = useAppSelector(selectUIState);
  const dispatch = useAppDispatch();
  const [inventoryCollapsed, setInventoryCollapsed] = useState(false);
  
  // Check if modal is active
  const isModalActive = uiState.modal === ModalIndicator.WITHDRAW || 
                         uiState.modal === ModalIndicator.DEPOSIT;

  // 严格检查inventory数据 - 确保有数据且不为空数组
  const hasInventoryData = userState?.player?.data.purchase && 
                         Array.isArray(userState.player.data.purchase) && 
                         userState.player.data.purchase.length > 0;

  // 每次userState变化时记录库存状态
  useEffect(() => {
    if (userState?.player?.data) {
      if (hasInventoryData) {
        console.log('Inventory data available:', userState.player.data.purchase.length, 'items');
      } else {
        console.log('No inventory data available');
      }
    }
  }, [userState, hasInventoryData]);

  function withdraw() {
    dispatch(setUIState({modal: ModalIndicator.WITHDRAW}));
  }

  function deposit() {
    dispatch(setUIState({modal: ModalIndicator.DEPOSIT}));
  }

  const toggleInventory = () => {
    setInventoryCollapsed(!inventoryCollapsed);
  };

  return (<>
     <MDBRow>
        <MDBCol md="12">
          <ProfileCard>
            <ProfileCardHeader>
              <h5>Player Profile</h5>
            </ProfileCardHeader>
            <ProfileCardBody>
                <BalanceDisplay>
                  <BalanceLabel>Balance:</BalanceLabel>
                  <BalanceValue>{userState?.player?.data.balance}</BalanceValue>
                </BalanceDisplay>

                <ButtonContainer>
                  <ActionButton 
                    variant="withdraw"
                    onClick={() => withdraw()} 
                    disabled={isModalActive}
                  >
                    {uiState.modal === ModalIndicator.WITHDRAW ? 'Processing...' : 'Withdraw'}
                  </ActionButton>
                  
                  <ActionButton 
                    variant="deposit"
                    onClick={() => deposit()} 
                    disabled={isModalActive}
                  >
                    {uiState.modal === ModalIndicator.DEPOSIT ? 'Processing...' : 'Deposit'}
                  </ActionButton>
                </ButtonContainer>
            </ProfileCardBody>
          </ProfileCard>
        </MDBCol>
      </MDBRow>
      
      <HeaderContainer>
        <HeaderLeft>
          <RecordContainer>
            <Record />
          </RecordContainer>
          <HeaderText>Inventory</HeaderText>
        </HeaderLeft>
        {hasInventoryData && (
          <CollapseButton onClick={toggleInventory}>
            {inventoryCollapsed ? '▼' : '▲'}
          </CollapseButton>
        )}
      </HeaderContainer>
      
      {!hasInventoryData ? (
        <EmptyInventory>
          Your inventory is empty. Buy some cards to get started!
        </EmptyInventory>
      ) : !inventoryCollapsed && userState?.player && (
        <>
          <RoundInfo>
            <FromRoundBadge>
              From Round: {userState.player.data.round}
            </FromRoundBadge>
            {userState.state && userState.player.data.round !== userState.state.round && (
              <RoundBadge>
                Current Round: {userState.state.round}
              </RoundBadge>
            )}
          </RoundInfo>
          
          <MDBRow>
          {
              userState.player.data.purchase.map((card:any) => {
                 return (
                    <MDBCol md="3" className="mt-3" key={card.index}>
                    <NuggetCard index={card.index} amount={card.amount}/>
                    </MDBCol>
                 );
              })
          }
          </MDBRow>
        </>
      )}
      
      {/* 将 WithdrawModal 放在应用程序根级别 */}
      <WithdrawModal 
        lpanel={document.getElementById('modal-root') || document.body} 
        balanceOf={(a)=>a.data.balance} 
        handleClose={()=>{dispatch(setUIState({modal: ModalIndicator.NONE}))}} 
      />
    </>);
}



