import React from 'react';
import { selectLastError, setLastTransactionError } from '../data/state';
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { AccountSlice } from "zkwasm-minirollup-browser";
import styled from 'styled-components';

import {
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
} from 'mdb-react-ui-kit';
//import './Modal.css'; // Optional: for styling the modal
//

const StyledModalContent = styled(MDBModalContent)`
  border-radius: 10px;
  overflow: hidden;
`;

const StyledModalHeader = styled(MDBModalHeader)`
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.textLight};
  border-bottom: none;
`;

const StyledModalTitle = styled(MDBModalTitle)`
  color: ${props => props.theme.textLight};
  font-weight: 600;
`;

const StyledModalBody = styled(MDBModalBody)`
  padding: 1.5rem;
  color: ${props => props.theme.error};
  background-color: ${props => props.theme.bgSecondary};
`;

const Modal = () => {
  const lastError = useAppSelector(selectLastError);
  const dispatch = useAppDispatch();

  function clearLastError() {
    //console.log(setLastTransactionError);
    dispatch(setLastTransactionError(null));
  }

  return (
  <MDBModal open={true} onClose={() => clearLastError()} tabIndex='-1'>
      <MDBModalDialog>
        <StyledModalContent>
          <StyledModalHeader>
            <StyledModalTitle>Error Occurred</StyledModalTitle>
          </StyledModalHeader>
          <StyledModalBody>
            {lastError?.errorInfo}
          </StyledModalBody>
        </StyledModalContent>
      </MDBModalDialog>
    </MDBModal>
  )
};

export default Modal;
