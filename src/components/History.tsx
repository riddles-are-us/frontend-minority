import React, { useEffect, useState } from 'react';
import { createCommand } from "zkwasm-minirollup-rpc";
import { sendTransaction } from '../request';
import { MDBRow, MDBCol, MDBBtn } from 'mdb-react-ui-kit';
import { selectUserState} from '../data/state';
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { AccountSlice } from "zkwasm-minirollup-browser";
import "./style.scss";

const INSTALL_PLAYER = 1n;
const WITHDRAW = 2n;
const DEPOSIT = 3n;
const BUY_CARD = 4n;
const CLAIM_REWARD = 5n;




export const HistoryPage = () => {
  const userState = useAppSelector(selectUserState);
  const dispatch = useAppDispatch();
  const l2account = useAppSelector(AccountSlice.selectL2Account);

  useEffect(() => {
  }, [userState]);

  const claimReward = (index: bigint) => {
    if(userState!.player) {
        const command = createCommand(BigInt(userState!.player!.nonce), CLAIM_REWARD, [index]);
        dispatch(sendTransaction({cmd: command,prikey: l2account!.getPrivateKey()}));
    }
  }

  return (
    <>
      <h3 className="mt-2"> Unclaimed Rewards </h3>
      <MDBRow>
      {
          userState!.player!.data.rounds.map((round:any) => {
            return (
              <MDBCol md="3" className="mt-4" key={round.round}>
                <p>round: {round.round}</p>
                <p>share: {round.ratio}</p>
                <MDBBtn onClick={()=>claimReward(BigInt(round.round))}>Claim Reward</MDBBtn>
              </MDBCol>
            );
          })
      }
      </MDBRow>
    </>
  );
}
