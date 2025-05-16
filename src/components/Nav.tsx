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
  width: 100%;
  
  span {
    color: ${props => props.theme.textLight};
    font-weight: 600;
    font-size: 1.1rem;
  }
`;

const NavContainer = styled(MDBContainer)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
  
  @media (max-width: 576px) {
    padding: 0.5rem;
  }
`;

const NavSection = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 576px) {
    &:last-child {
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 8px;
    }
  }
`;

const LogoSection = styled(NavSection)`
  @media (max-width: 576px) {
    font-size: 0.9rem;
    margin-right: auto;
  }
`;

export default function Nav() {
  return (
    <StyledNavbar expand='lg'>
      <NavContainer fluid>
        <LogoSection>
          <span className="navbar-brand">Minority Game</span>
        </LogoSection>
        <NavSection>
          <ConnectButton handleRestart={()=>{return;}}></ConnectButton>
          <div style={{ width: '12px' }}></div>
          <LoginButton handleRestart={()=>{return;}}></LoginButton>
        </NavSection>
      </NavContainer>
    </StyledNavbar>
  );
}