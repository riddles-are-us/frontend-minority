import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { sendTransaction } from "../request";
import { AccountSlice } from "zkwasm-minirollup-browser";
import { Alert, Modal, Button, InputGroup, Form, Spinner, ButtonProps } from "react-bootstrap";
import {PlayerInfo, selectUserState} from "../data/state";
import {createWithdrawCommand} from "zkwasm-minirollup-rpc";
import {ModalIndicator, selectUIResponse, selectUIState, setUIResponse, setUIState} from "../data/ui";
import styled from 'styled-components';
import Loader from './Loader';


const CMD_WITHDRAW = 8n;

interface StyledModalProps {
  modalType?: 'withdraw' | 'deposit';
}

const StyledModal = styled.div<StyledModalProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  
  .modal-content {
    width: 100%;
    max-width: 500px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    animation: modalFadeIn 0.3s ease;
    
    @keyframes modalFadeIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
  
  .modal-header {
    background: linear-gradient(135deg, ${props => props.theme.primary} 0%, ${props => props.theme.primaryDark} 100%);
    border-bottom: none;
    padding: 1.25rem 1.5rem;
    
    .modal-title {
      color: ${props => props.theme.textLight};
      font-weight: 700;
      display: flex;
      align-items: center;
      
      &::before {
        content: ${props => props.modalType === 'withdraw' ? '"↑"' : '"↓"'};
        margin-right: 10px;
        font-size: 1.2rem;
      }
    }
    
    .btn-close {
      color: white;
      opacity: 0.8;
      
      &:hover {
        opacity: 1;
      }
    }
  }
  
  .modal-body {
    background-color: ${props => props.theme.bgSecondary};
    padding: 1.5rem;
  }
  
  .alert {
    background-color: rgba(255, 255, 255, 0.6);
    border-left: 4px solid ${props => props.theme.info};
    border-top: none;
    border-right: none;
    border-bottom: none;
    color: ${props => props.theme.textSecondary};
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
  
  .alert-danger {
    background-color: ${props => props.theme.error}15;
    border-color: ${props => props.theme.error};
    color: ${props => props.theme.error};
  }
  
  p {
    color: ${props => props.theme.textSecondary};
    margin-bottom: 1.25rem;
  }
  
  .form-control {
    background-color: rgba(255, 255, 255, 0.8);
    border: 1px solid ${props => props.theme.primaryLight};
    border-radius: 8px;
    padding: 0.75rem 1rem;
    transition: all 0.2s ease;
    
    &:focus {
      box-shadow: 0 0 0 0.2rem ${props => props.theme.primary}30;
      border-color: ${props => props.theme.primary};
      background-color: white;
    }
  }
  
  .form-control:disabled {
    background-color: ${props => props.theme.bgDark};
    opacity: 0.7;
  }
  
  .modal-footer {
    background-color: ${props => props.theme.bgSecondary};
    border-top: none;
    justify-content: center;
    padding: 1rem 1.5rem 1.5rem;
    gap: 1rem;
  }
  
  /* Button styles */
  .btn-cancel {
    background-color: ${props => props.theme.bgPrimary};
    border: 1px solid ${props => props.theme.textSecondary}50;
    color: ${props => props.theme.textSecondary};
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s ease;
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.bgDark};
      transform: translateY(-2px);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }
  
  /* Theme button styles */
  .theme-button {
    background: ${props => props.modalType === 'withdraw' 
      ? `linear-gradient(135deg, ${props.theme.error} 0%, ${props.theme.error}dd 100%)`
      : `linear-gradient(135deg, ${props.theme.success} 0%, ${props.theme.success}dd 100%)`};
    border: none;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
    
    &:disabled {
      opacity: 0.7;
    }
  }
  
  .loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 15px 0;
    
    .success-message {
      margin-left: 15px;
      color: ${props => props.theme.success};
      font-weight: 600;
      display: flex;
      align-items: center;
      
      &::before {
        content: "✓";
        display: inline-block;
        margin-right: 8px;
        color: white;
        background-color: ${props => props.theme.success};
        width: 22px;
        height: 22px;
        border-radius: 50%;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
`;

interface Props {
  handleClose: () => void;
  balanceOf: (info: PlayerInfo) => number;
  lpanel: HTMLElement;
}

export const formatErrorMessage = (error: any): string => {
  const fullMessage = error.message || "Unknown error";
  const message = fullMessage.replace(/\([^)]*\)/g, "");
  if (message) {
    return message;

  } else {
    return fullMessage.Error;
  }
};

function getWithdrawTransactionCommandArray(nonce: bigint, amount: bigint, account: AccountSlice.L1AccountInfo): BigUint64Array {
  const address = account!.address.slice(2);
  const command = createWithdrawCommand(
          nonce,
          CMD_WITHDRAW,
          address,
          0n,
          amount
  );
  return command;
}

export const WithdrawModal = ({
  handleClose,
  balanceOf,
  lpanel
}: Props) => {

  const dispatch = useAppDispatch();
  const userState = useAppSelector(selectUserState);
  const uiState = useAppSelector(selectUIState);
  const lastResponse = useAppSelector(selectUIResponse);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  const l1account = useAppSelector(AccountSlice.selectL1Account);
  const [amount, setAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);


  const handleResult = (msg: string) => {
    dispatch(setUIResponse(msg));
    dispatch(setUIState({modal: ModalIndicator.RESPONSE}));
  }

  const withdraw = (amount: number) => {
    dispatch(
      sendTransaction({
        cmd: getWithdrawTransactionCommandArray(
          BigInt(userState!.player!.nonce),
          BigInt(amount),
          l1account!
        ),
        prikey: l2account!.getPrivateKey(),
      })
    ).then((action) => {
      if (sendTransaction.fulfilled.match(action)) {
        setTransactionComplete(true);
        setTimeout(() => {
          handleResult("Withdraw successful");
          setIsExecuting(false);
          setErrorMessage("");
          setTransactionComplete(false);
          closeModal();
        }, 2000);
      } else if(sendTransaction.rejected.match(action)) {
        setErrorMessage("Withdraw Error: " + action.payload);
        setIsExecuting(false);
      }
    })
  };

  const deposit = (amount: string) => {
    dispatch(
      AccountSlice.depositAsync({
        tokenIndex: 0,
        amount: Number(BigInt(amount)),
        l2account: l2account!,
        l1account: l1account!,
      })
    ).then((action) => {
      if (AccountSlice.depositAsync.fulfilled.match(action)) {
        setTransactionComplete(true);
        setTimeout(() => {
          setIsExecuting(false);
          handleResult("Deposit Success: " + action.payload!.hash);
          setTransactionComplete(false);
          closeModal();
        }, 2000);
      } else if (AccountSlice.depositAsync.rejected.match(action)) {
        if (action.error.message == null) {
          setErrorMessage("Deposit Failed: Unknown Error");
        } else if (action.error.message.startsWith("user rejected action")) {
          setErrorMessage("Deposit Failed: User rejected action");
        } else {
          setErrorMessage("Deposit Failed: " + action.error.message);
        }
        setIsExecuting(false);
      }
    });
  };

  const onConfirm = async () => {
    try {
      setErrorMessage("");
      if (!amount) {
        throw new Error("The amount is missing");
      }

      if (uiState.modal == ModalIndicator.WITHDRAW) {
        if (Number(amount) > balanceOf(userState!.player!)) {
          setErrorMessage("Not Enough Balance");
        } else {
          setErrorMessage("");
          setIsExecuting(true);
          withdraw(Number(amount));
        }
      } else {
        setIsExecuting(true);
        deposit(amount);
      }
    } catch (error) {
      const err = formatErrorMessage(error);
      setErrorMessage(`Error: ${err}`);
      setIsExecuting(false);
    }
  }

  const closeModal = () => {
    setAmount("");
    setErrorMessage("");
    dispatch(setUIState({modal: ModalIndicator.NONE}));
  }

  const proxyAddr = process.env.REACT_APP_DEPOSIT_CONTRACT!;
  const tokenAddr = process.env.REACT_APP_TOKEN_CONTRACT!;

  // 使用专用的模态框挂载点
  const modalTarget = document.getElementById('modal-root') || document.body;

  return (
    <>
    {uiState.modal == ModalIndicator.RESPONSE &&
      ReactDOM.createPortal(
      (<StyledModal>
          <div className="modal-content">
            <div className="modal-body">
              {lastResponse}
              <div className="text-center mt-3">
                <Button 
                  variant="primary" 
                  onClick={closeModal} 
                  className="theme-button"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
      </StyledModal>),
      modalTarget
    )}
    {(uiState.modal == ModalIndicator.WITHDRAW || uiState.modal == ModalIndicator.DEPOSIT) &&
      ReactDOM.createPortal(
      (<StyledModal modalType={uiState.modal == ModalIndicator.WITHDRAW ? 'withdraw' : 'deposit'}>
        <div className="modal-content">
          <Modal.Header closeButton onHide={closeModal}>
            <Modal.Title>{uiState.modal == ModalIndicator.WITHDRAW ? "Withdraw" : "Deposit"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert>Game contract {proxyAddr}</Alert>
            <Alert>Token contract {tokenAddr}</Alert>

            {uiState.modal == ModalIndicator.DEPOSIT &&
            <p> Please provide the amount you want to deposit:
              (there will be a small delay for the game server to notice your deposit)
            </p>
            }
            {uiState.modal == ModalIndicator.WITHDRAW &&
            <p> Please provide the amount you want to withdraw:
              (there will be a small delay for the withdraw to be settled through the game contract)
            </p>
            }
            <InputGroup className="mb-3">
              <Form.Control
                type="number"
                placeholder={"Please enter amount"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                required
                disabled={isExecuting}
              />
            </InputGroup>
            
            {isExecuting && (
              <div className="loader-container">
                <Loader />
                {transactionComplete && 
                  <span className="success-message">
                    {uiState.modal == ModalIndicator.WITHDRAW ? "Withdrawal Complete!" : "Deposit Complete!"}
                  </span>
                }
              </div>
            )}
            
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={closeModal} 
              disabled={isExecuting}
              className="btn-cancel"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={onConfirm} 
              disabled={isExecuting}
              className="theme-button"
            >
              {isExecuting ? 'Processing...' : 'Confirm'}
            </Button>
          </Modal.Footer>
        </div>
      </StyledModal>),
      modalTarget
    )}
    </>
  );
};
