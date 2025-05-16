import React from 'react';
import { ConnectButton, LoginButton } from "../components/Connect";
import {
  MDBContainer,
  MDBNavbar
} from 'mdb-react-ui-kit';
import styled from 'styled-components';

const StyledNavbar = styled(MDBNavbar)`
  background-color: ${props => props.theme.primary} !important;
  color: ${props => props.theme.textLight};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  span {
    color: ${props => props.theme.textLight};
    font-weight: 600;
    font-size: 1.1rem;
  }
`;

export default function Nav() {
  return (
    <StyledNavbar expand='lg'>
      <MDBContainer fluid>
        <ConnectButton handleRestart={()=>{return;}}></ConnectButton>
        <LoginButton handleRestart={()=>{return;}}></LoginButton>
      </MDBContainer>
    </StyledNavbar>
  );
}