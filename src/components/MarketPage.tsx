import React, { useEffect, useState } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardHeader, MDBTable, MDBTableBody, MDBTableHead, MDBBtn } from 'mdb-react-ui-kit';
import { selectUserState, Nugget } from '../data/state';
import { AccountSlice, ConnectState } from "zkwasm-minirollup-browser";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { NuggetCard } from "../components/NuggetCard";
import "./style.scss";
import styled from 'styled-components';

const PageHeader = styled.h3`
  color: ${props => props.theme.primary};
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid ${props => props.theme.primaryLight};
  padding-bottom: 0.5rem;
`;

export const MarketPage = () => {
  const userState = useAppSelector(selectUserState);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  const dispatch = useAppDispatch();

  useEffect(() => {
  }, [userState]);

  return (
    <>
      <PageHeader>Card List</PageHeader>
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
    </>
  );
};
