import React, { useEffect, useState } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardHeader, MDBTable, MDBTableBody, MDBTableHead, MDBBtn } from 'mdb-react-ui-kit';
import { selectUserState, Nugget } from '../data/state';
import { AccountSlice, ConnectState } from "zkwasm-minirollup-browser";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { NuggetCard } from "../components/NuggetCard";
import ChartPage from "../components/Chart";
import "./style.scss";


export const MarketPage = () => {
  const userState = useAppSelector(selectUserState);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  const dispatch = useAppDispatch();

  useEffect(() => {
  }, [userState]);

  return (
    <>
      <h3 className="mt-2"> Card List </h3>
      <MDBRow>
      {
          userState!.state.cards.map((card:number, index:number) => {
            return (
              <MDBCol md="3" className="mt-4" key={index}>
                  <NuggetCard index={index} amount={card}/>
              </MDBCol>
            );
          })
      }
      </MDBRow>
      {userState?.state && <ChartPage></ChartPage>
      }
    </>
  );
};
