/* eslint-disable */
import React, { useRef, useEffect, useState, useCallback } from "react";
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
import AnimatedBackground from "../components/AnimatedBackground";
import {
    MDBBtn,
    MDBContainer,
} from 'mdb-react-ui-kit';
import styled from 'styled-components';

// 深度比较两个对象是否相等
const isEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== 'object' || obj1 === null || 
      typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    
    if (!isEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};

// 添加防抖函数
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

const StyledContainer = styled(MDBContainer)`
  background-color: ${props => props.theme.bgSecondary};
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(255, 152, 0, 0.2);
  border: 1px solid rgba(255, 152, 0, 0.1);
  margin-top: 2rem !important;
  margin-bottom: 2rem !important;
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
  const [inc, setInc] = useState<number>(0);
  
  // 使用ref来跟踪上次请求的时间，防止重复请求
  const lastRequestTimeRef = useRef<number>(0);
  // 使用ref来跟踪是否有挂起的请求
  const hasPendingRequestRef = useRef<boolean>(false);
  // 轮询间隔时间
  const POLL_INTERVAL = 3000; // 3 seconds
  // 防止重复请求的最小间隔
  const MIN_REQUEST_INTERVAL = 1000; // 1 second
  
  // 更新状态函数，使用useCallback以避免不必要的重渲染
  const updateState = useCallback(() => {
    const now = Date.now();
    
    // 避免频繁请求：确保距离上次请求至少间隔MIN_REQUEST_INTERVAL毫秒
    // 并且确保没有挂起的请求
    if (connectState >= ConnectState.Idle && l2account && 
        !hasPendingRequestRef.current && 
        now - lastRequestTimeRef.current > MIN_REQUEST_INTERVAL) {
      
      // 更新上次请求时间和挂起状态
      lastRequestTimeRef.current = now;
      hasPendingRequestRef.current = true;
      
      // 记录当前的用户状态，便于调试
      if (userState?.player) {
        console.log(`Main - Polling with nonce: ${userState.player.nonce}`);
      }
      
      // 发起请求
      dispatch(queryState(l2account.getPrivateKey()))
        .then((action) => {
          // 检查请求是否成功
          if (queryState.fulfilled.match(action)) {
            const data = action.payload;
            if (data?.player) {
              console.log(`Main - Updated state, new nonce: ${data.player.nonce}`);
            }
          }
        })
        .finally(() => {
          // 请求完成后，设置挂起状态为false
          hasPendingRequestRef.current = false;
        });
    }
    
    // 更新计数器以触发下一次轮询
    setInc(prevInc => prevInc + 1);
  }, [connectState, l2account, dispatch, userState]);
  
  // 初始化获取数据，只在组件挂载时或状态变化时进行一次
  useEffect(() => {
    if (l2account && connectState === ConnectState.Init) {
      dispatch(queryState(l2account.getPrivateKey()));
    } else if (connectState === ConnectState.Init) {
      dispatch(queryInitialState("1"));
    }
  }, [l2account, connectState, dispatch]);
  
  // 设置轮询
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateState();
    }, POLL_INTERVAL);
    
    // 清理函数，确保在组件卸载时取消任何挂起的超时
    return () => {
      clearTimeout(timeoutId);
    };
  }, [inc, updateState]);

  // 安装玩家
  useEffect(() => {
    if (connectState === ConnectState.InstallPlayer && l2account) {
      const command = createCommand(0n, REGISTER_PLAYER, []);
      dispatch(sendTransaction({
        cmd: command,
        prikey: l2account.getPrivateKey()
      }));
    }
  }, [connectState, l2account, dispatch]);

  return (
    <>
      <AnimatedBackground />
      <Nav />
      <StyledContainer>
      {userState?.player &&
        <User/>
      }
      {userState?.player &&
        <HistoryPage/>
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
