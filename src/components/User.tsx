import React, {useRef, useEffect, useState } from 'react';
import {  MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardHeader, MDBBtn } from 'mdb-react-ui-kit';
import { selectUserState } from '../data/state';
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { NuggetCard } from "../components/NuggetCard";
import { WithdrawModal } from "../components/Common";
import { setUIState, ModalIndicator, selectUIState } from "../data/ui";
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

const SectionHeader = styled.h3`
  color: ${props => props.theme.primary};
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid ${props => props.theme.primaryLight};
  padding-bottom: 0.5rem;
`;

export const User = () => {
  const userState = useAppSelector(selectUserState);
  const uiState = useAppSelector(selectUIState);
  const dispatch = useAppDispatch();

  const lpanel = useRef<HTMLDivElement | null>(null);
  
  // Check if modal is active
  const isModalActive = uiState.modal === ModalIndicator.WITHDRAW || 
                         uiState.modal === ModalIndicator.DEPOSIT;

  useEffect(() => {
  }, [userState]);


  function withdraw() {
    dispatch(setUIState({modal: ModalIndicator.WITHDRAW}));
  }

  function deposit() {
    dispatch(setUIState({modal: ModalIndicator.DEPOSIT}));
  }

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
      <SectionHeader>Inventory</SectionHeader>
      <MDBRow>
      {
          userState!.player!.data.purchase.map((card:any) => {
             return (
                <MDBCol md="3" className="mt-3" key={card.index}>
                <NuggetCard index={card.index} amount={card.amount}/>
                </MDBCol>
             );}
          )
      }
      </MDBRow>
    </>);
}



