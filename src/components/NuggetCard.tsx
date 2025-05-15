import React, {useRef, useEffect, useState } from 'react';
import { createCommand } from "zkwasm-minirollup-rpc";
import { MDBCard, MDBCardBody, MDBCardHeader, MDBBtn } from 'mdb-react-ui-kit';
import { sendTransaction } from '../request';
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { AccountSlice, ConnectState } from "zkwasm-minirollup-browser";
import { selectUserState } from '../data/state';

const INSTALL_PLAYER = 1n;
const WITHDRAW = 2n;
const DEPOSIT = 3n;
const BUY_CARD = 4n;
const CLAIM_REWARD = 5n;

export function NuggetCard(params: {index: number, amount: number}) {
  const dispatch = useAppDispatch();
  const userState = useAppSelector(selectUserState);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  const buyCard= (index: bigint, amount: bigint) => {
    if(userState!.player) {
        const command = createCommand(BigInt(userState!.player!.nonce), BUY_CARD, [index, amount]);
        dispatch(sendTransaction({cmd: command,prikey: l2account!.getPrivateKey()}));
    }
  }


  return (<MDBCard>
    <MDBCardHeader>
      <div className="d-flex">
        <h5>NuggetID: {params.index} </h5>
      </div>
    </MDBCardHeader>
    <MDBCardBody>
      <p>holder: {params.amount}</p>
      <MDBBtn onClick={()=>buyCard(BigInt(params.index), 1n)}>buy</MDBBtn>
    </MDBCardBody>
  </MDBCard>
  )
}
