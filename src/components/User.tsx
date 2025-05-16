import React, {useRef, useEffect, useState } from 'react';
import {  MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardHeader, MDBBtn } from 'mdb-react-ui-kit';
import { selectUserState } from '../data/state';
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { NuggetCard } from "../components/NuggetCard";
import { WithdrawModal } from "../components/Common";
import { setUIState, ModalIndicator, selectUIState } from "../data/ui";
import Record from "./Record";
import styled from 'styled-components';

const StyledCard = styled(MDBCard)`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
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
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    
    span {
      color: ${props => props.theme.primary};
      font-weight: 600;
    }
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
  margin-right: 0.75rem;
  
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

// 调整Record动画大小的容器
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

const SectionHeader = styled.h3`
  color: ${props => props.theme.primary};
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid ${props => props.theme.primaryLight};
  padding-bottom: 0.5rem;
`;

// 为轮次信息添加样式
const RoundInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0.5rem 0;
  flex-wrap: wrap;
  gap: 1rem;
`;

// 新的From Round徽章样式
const FromRoundBadge = styled.div`
  background-color: ${props => props.theme.secondary};
  color: ${props => props.theme.textLight};
  font-weight: bold;
  font-size: 1rem;
  padding: 0.5rem 1.25rem;
  border-radius: 2rem;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  border: 1px solid ${props => props.theme.secondaryDark};
  
  &::before {
    content: "•";
    display: inline-block;
    margin-right: 0.5rem;
    font-size: 1.5rem;
    line-height: 0;
    color: ${props => props.theme.accentLight};
  }
`;

// 改进徽章样式，使其更加显眼
const RoundBadge = styled.div`
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.textLight};
  font-weight: bold;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  margin-left: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.primaryDark};
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

export const User = () => {
  const userState = useAppSelector(selectUserState);
  const uiState = useAppSelector(selectUIState);
  const dispatch = useAppDispatch();
  const [inventoryCollapsed, setInventoryCollapsed] = useState(false);

  const lpanel = useRef<HTMLDivElement | null>(null);
  
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
          <StyledCard>
            <StyledCardHeader>
              <div className="d-flex">
                <h5>Player Profile</h5>
              </div>
            </StyledCardHeader>
            <StyledCardBody>
                <p>Balance: <span>{userState?.player?.data.balance}</span></p>
                <div ref={lpanel}/>
                {lpanel.current &&
                  <WithdrawModal lpanel={lpanel.current} balanceOf={(a)=>a.data.balance} handleClose={()=>{return;}} ></WithdrawModal>
                }

                <StyledButton 
                  onClick={() => withdraw()} 
                  disabled={isModalActive}
                >
                  {uiState.modal === ModalIndicator.WITHDRAW ? 'Processing...' : 'Withdraw'}
                </StyledButton>
                
                <StyledButton 
                  onClick={() => deposit()} 
                  disabled={isModalActive}
                >
                  {uiState.modal === ModalIndicator.DEPOSIT ? 'Processing...' : 'Deposit'}
                </StyledButton>
            </StyledCardBody>
          </StyledCard>
        </MDBCol>
      </MDBRow>
      
      {/* 只有当真正有库存数据时才显示此部分 */}
      {hasInventoryData && userState?.player && (
        <>
          <HeaderContainer>
            <HeaderLeft>
              <RecordContainer>
                <Record />
              </RecordContainer>
              <HeaderText>Inventory</HeaderText>
            </HeaderLeft>
            <CollapseButton onClick={toggleInventory}>
              {inventoryCollapsed ? '▼' : '▲'}
            </CollapseButton>
          </HeaderContainer>
          
          {!inventoryCollapsed && (
            <>
              {/* 显示库存所属的轮次信息 */}
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
        </>
      )}
    </>);
}



