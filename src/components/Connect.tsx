import React from "react";
import "./style.scss";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {AccountSlice} from "zkwasm-minirollup-browser";
import {
    MDBBtn,
} from 'mdb-react-ui-kit';
import { addressAbbreviation } from "../utils/address";
import styled from 'styled-components';

interface IProps {
  handleRestart: () => void;
}

// Define type for button props
interface StyledButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}

const StyledMDBBtn = styled(MDBBtn)<StyledButtonProps>`
  background-color: ${props => props.theme.primary} !important;
  color: white !important;
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
  &:hover {
    background-color: ${props => props.theme.primaryLight} !important;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2) !important;
  }
  &:active {
    background-color: ${props => props.theme.primaryDark} !important;
  }
  
  @media (max-width: 576px) {
    font-size: 0.75rem;
    padding: 0.35rem 0.7rem;
  }
`;

const DisconnectButton = styled(MDBBtn)<StyledButtonProps>`
  background-color: ${props => props.theme.error} !important;
  color: white !important;
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
  margin-left: 0.6rem;
  &:hover {
    background-color: #ff6b6b !important;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2) !important;
  }
  
  @media (max-width: 576px) {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
    margin-left: 0.4rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  
  span {
    @media (max-width: 576px) {
      font-size: 0.8rem;
    }
  }
`;

const AddressSpan = styled.span`
  @media (max-width: 576px) {
    font-size: 0.8rem;
  }
`;

// 清除本地存储的连接信息
const clearLocalStorage = () => {
  localStorage.removeItem('l1Account');
  localStorage.removeItem('l2Account');
  localStorage.removeItem('wallet_connected');
  
  // 清除其他可能存在的相关项
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.includes('wallet') || key.includes('account') || key.includes('web3')) {
      localStorage.removeItem(key);
    }
  }
};

export function ConnectButton(props: IProps) {
  const dispatch = useAppDispatch();
  const l1account = useAppSelector(AccountSlice.selectL1Account);
  
  function connect() {
    dispatch(AccountSlice.loginL1AccountAsync());
  }
  
  function disconnect() {
    // 清除本地存储
    clearLocalStorage();
    
    // 刷新页面以应用更改
    window.location.reload();
  }
  
  if (l1account) {
    return (
      <ButtonContainer>
        <AddressSpan>{addressAbbreviation(l1account!.address, 5)}</AddressSpan>
        <DisconnectButton onClick={disconnect}>Disconnect</DisconnectButton>
      </ButtonContainer>
    );
  } else {
    return (
        <StyledMDBBtn onClick={connect}>connect</StyledMDBBtn>
    );
  }
}

export function LoginButton(props: IProps) {
  const dispatch = useAppDispatch();
  const l1account = useAppSelector(AccountSlice.selectL1Account);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  function login() {
    if (l1account) {
        dispatch(AccountSlice.loginL2AccountAsync("ZKWASM-BEAT"));
    }
  }

  if (l1account) {
    if (l2account) {
      const l2addresshex = "0x" + l2account.pubkey;
      return <AddressSpan>ID: {addressAbbreviation(l2addresshex, 5)}</AddressSpan>
    } else {
      return <StyledMDBBtn onClick={login}>login apps</StyledMDBBtn>
    }
  } else {
    return <></>
  }
}
