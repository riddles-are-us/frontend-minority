import React, {useRef, useEffect, useState } from 'react';
import {  MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardHeader, MDBBtn } from 'mdb-react-ui-kit';
import { selectUserState } from '../data/state';
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { NuggetCard } from "../components/NuggetCard";
import { WithdrawModal } from "../components/Common";
import { setUIState, ModalIndicator } from "../data/ui";

export const User = () => {
  const userState = useAppSelector(selectUserState);
  const dispatch = useAppDispatch();

  const lpanel = useRef<HTMLDivElement | null>(null);

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
          <MDBCard>
            <MDBCardHeader>
              <div className="d-flex">
                <h5>
                  Player Avator
                </h5>
              </div>
            </MDBCardHeader>
            <MDBCardBody>
                <p>Balance: {userState?.player?.data.balance}</p>
                <div ref={lpanel}/>
                {lpanel.current &&
                  <WithdrawModal lpanel={lpanel.current} balanceOf={(a)=>a.data.balance} handleClose={()=>{return;}} ></WithdrawModal>
                }

                <MDBBtn onClick={() => withdraw()}>withdraw </MDBBtn>
                <MDBBtn onClick={() => deposit()}>deposit</MDBBtn>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
      <h3 className="mt-2"> Inventory </h3>
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



