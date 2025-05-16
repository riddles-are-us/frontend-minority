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
// 更新轮询间隔为3秒，减少卡顿
const POLLING_INTERVAL = 3000;

export function Main() {
  const connectState = useAppSelector(selectConnectState);
  const userState = useAppSelector(selectUserState);
  const lastError = useAppSelector(selectLastError);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  const dispatch = useAppDispatch();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef<boolean>(false);
  // 用于存储上一次请求的数据，避免重复渲染
  const lastDataRef = useRef<any>(null);
  // 跟踪上次更新时间，避免频繁更新
  const lastUpdateTimeRef = useRef<number>(Date.now());
  
  // 统一的数据更新函数 - 添加优化逻辑
  const updateAllData = useCallback(() => {
    // 检查距离上次更新是否至少过了1秒
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 1000) {
      console.log('Skipping update - too soon since last update');
      return;
    }
    
    if (connectState === ConnectState.Idle && l2account) {
      console.log('Unified polling - updating all data...');
      
      // 使用强制刷新标志，确保后端返回所有数据
      dispatch(queryState(l2account.getPrivateKey()))
        .then((action) => {
          if (queryState.fulfilled.match(action)) {
            // 检查返回的数据是否包含必要的字段
            const data = action.payload;
            
            // 只在数据真正变化时才记录和处理
            if (!isEqual(data, lastDataRef.current)) {
              lastDataRef.current = data;
              lastUpdateTimeRef.current = Date.now();
              
              if (data && data.player && data.state) {
                console.log('Data changed, updating UI');
                console.log('- Round:', data.state.round);
                console.log('- Counter:', data.state.counter);
              } else {
                console.warn('Data returned but may be incomplete');
                // 如果关键数据缺失，再次尝试 - 使用防抖函数避免过多请求
                setTimeout(() => {
                  console.log('Retrying to get complete data...');
                  dispatch(queryState(l2account.getPrivateKey()));
                }, 1000);
              }
            } else {
              console.log('Data unchanged, skipping update');
            }
          } else {
            console.warn('Failed to update data');
          }
        });
    } else if (connectState === ConnectState.Init) {
      console.log('Updating initial state...');
      dispatch(queryInitialState("1"));
    }
  }, [connectState, l2account, dispatch]);
  
  // 使用防抖版本的更新函数，减少过于频繁的调用
  const debouncedUpdateAllData = useCallback(
    debounce(updateAllData, 300),
    [updateAllData]
  );

  // 处理交易完成后的数据刷新
  const refreshAfterTransaction = useCallback(() => {
    // 延迟确保服务器有时间处理交易
    setTimeout(() => {
      console.log('Refreshing data after transaction...');
      updateAllData();
    }, 500);
  }, [updateAllData]);
  
  // 监听交易完成
  useEffect(() => {
    // 监听交易成功事件来刷新数据
    const handleTransactionUpdate = () => {
      refreshAfterTransaction();
    };
    
    // 这里可以添加监听交易事件的代码
    // 例如订阅Redux状态的交易事件
    
    return () => {
      // 移除事件监听器
    };
  }, [refreshAfterTransaction]);

  // 监听userState变化，检查数据完整性 - 使用防抖减少频繁调用
  useEffect(() => {
    if (userState) {
      // 检查数据是否完整
      const hasInventory = userState.player && 
                           userState.player.data && 
                           Array.isArray(userState.player.data.purchase);
                           
      const hasRewards = userState.player && 
                         userState.player.data && 
                         Array.isArray(userState.player.data.rounds);
      
      if (!hasInventory || !hasRewards) {
        console.warn('Incomplete user data detected, forcing refresh');
        if (l2account) {
          // 如果数据不完整，使用防抖函数重新请求
          setTimeout(() => debouncedUpdateAllData(), 500);
        }
      }
    }
  }, [userState, l2account, debouncedUpdateAllData]);

  // 处理计时器归零的情况 - 简化为仅调用数据更新函数
  const handleTimerEnd = useCallback(() => {
    console.log('Timer reached zero, refreshing all data...');
    updateAllData();
  }, [updateAllData]);

  // 初始化 - 第一次加载组件时获取数据
  useEffect(() => {
    if (l2account && connectState === ConnectState.Init) {
      dispatch(queryState(l2account.getPrivateKey()));
    } else {
      dispatch(queryInitialState("1"));
    }
  }, [l2account, connectState, dispatch]);

  // 当用户状态改变时更新时间显示 - 添加检测避免不必要更新
  useEffect(() => {
    if (userState?.state) {
      const currentRound = userState.state.round;
      const counter = userState.state.counter;
      
      // 计算新的倒计时时间
      const newServerTimeLeft = (counter+1) * 5;
      
      // 只在时间真正改变时更新状态
      if (newServerTimeLeft !== timeLeft) {
        console.log('Time changed - Round:', currentRound, 'Counter:', counter);
        // 直接更新显示的倒计时为服务器时间
        setTimeLeft(newServerTimeLeft);
      }
      
      // 如果时间为0或小于0，立即触发更新
      if (newServerTimeLeft <= 0) {
        console.log('Server time is zero or negative');
        // 不再调用handleTimerEnd，避免重复请求
      }
    }
  }, [userState, timeLeft]);

  // 统一的轮询机制 - 使用更长间隔，减少不必要的更新
  useEffect(() => {
    // 清理任何现有的轮询
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      isPollingRef.current = false;
    }
    
    // 只有在已连接并登录后才开始轮询
    const shouldStartPolling = 
      connectState === ConnectState.Idle && 
      l2account;
      
    if (shouldStartPolling) {
      console.log('Starting optimized polling - 3 second interval');
      isPollingRef.current = true;
      
      // 立即进行一次完整更新
      updateAllData();
      
      // 开始统一的轮询 - 使用优化后的间隔和防抖函数
      pollingIntervalRef.current = setInterval(() => {
        debouncedUpdateAllData();
      }, POLLING_INTERVAL);
    }
    
    // 清理函数
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        isPollingRef.current = false;
      }
    };
  }, [connectState, l2account, updateAllData, debouncedUpdateAllData]);

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
