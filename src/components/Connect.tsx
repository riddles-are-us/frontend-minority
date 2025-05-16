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
  &:hover {
    background-color: ${props => props.theme.primaryLight} !important;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2) !important;
  }
  &:active {
    background-color: ${props => props.theme.primaryDark} !important;
  }
`;

export function ConnectButton(props: IProps) {
  const dispatch = useAppDispatch();
  const l1account = useAppSelector(AccountSlice.selectL1Account);
  function connect() {
    dispatch(AccountSlice.loginL1AccountAsync());
  }
  if (l1account) {
    return <span>{addressAbbreviation(l1account!.address, 5)}</span>
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
      return <span>ID: {addressAbbreviation(l2addresshex, 5)}</span>
    } else {
      return <StyledMDBBtn onClick={login}>login apps</StyledMDBBtn>
    }
  } else {
    return <></>
  }
}
