/* eslint-disable */
import React, { useRef, useEffect, useState } from "react";
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./style.scss";
import { selectConnectState, selectUserState, selectLastError } from "../data/state";
import { setUIState, ModalIndicator, selectUIState } from "../data/ui";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { AccountSlice, ConnectState } from "zkwasm-minirollup-browser";
import { queryInitialState, queryState, sendTransaction } from "../request";
import { createCommand } from "zkwasm-minirollup-rpc";
import { MarketPage } from "../components/MarketPage";
import { User } from "../components/User";
import Nav from "../components/Nav";
import ErrorModal from "../components/ErrorModal";
import { HistoryPage } from "../components/History";
import {
    MDBBtn,
    MDBContainer,
} from 'mdb-react-ui-kit';
import styled from 'styled-components';

const StyledContainer = styled(MDBContainer)`
  background-color: ${props => props.theme.bgSecondary};
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 2rem !important;
`;

const InfoText = styled.p`
  color: ${props => props.theme.textSecondary};
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  
  span {
    font-weight: bold;
    color: ${props => props.theme.primary};
  }
`;

const REGISTER_PLAYER = 1n;

export function Main() {
  const connectState = useAppSelector(selectConnectState);
  const userState = useAppSelector(selectUserState);
  const lastError = useAppSelector(selectLastError);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  const dispatch = useAppDispatch();
  const uiState = useAppSelector(selectUIState);
  const [inc, setInc] = useState(0);

  function updateState() {
    if (connectState == ConnectState.Idle) {
      dispatch(queryState(l2account!.getPrivateKey()));
    } else if (connectState == ConnectState.Init) {
      dispatch(queryInitialState("1"));
    }
    setInc(inc + 1);
  }

  useEffect(() => {
    if (l2account && connectState == ConnectState.Init) {
      dispatch(queryState(l2account!.getPrivateKey()));
    } else {
      dispatch(queryInitialState("1"));
    }
  }, [l2account]);

  useEffect(() => {
    if (connectState == ConnectState.InstallPlayer) {
      const command = createCommand(0n, REGISTER_PLAYER, []);
      dispatch(sendTransaction({
        cmd: command,
        prikey: l2account!.getPrivateKey()
      }));
    }
  }, [connectState]);

  return (
    <>
      <Nav />
      <StyledContainer>
      {userState?.player &&
      <User/>
      }
      {userState?.player &&
      <HistoryPage/>
      }
      {userState?.state &&
        <>
        <InfoText>Current Round <span>{userState?.state.round}</span></InfoText>
        <InfoText>Time left <span>{userState?.state.counter * 5}</span></InfoText>
        </>
      } 

      {userState?.state &&
      <MarketPage />
      }
      </StyledContainer>
      {lastError &&
      <ErrorModal/>
      }
    </>
  );
}
