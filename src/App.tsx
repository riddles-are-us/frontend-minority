import React, { useEffect, useState } from 'react';
import { Main } from './layout/Main';
import ConnectPage from './ConnectPage';
import './App.css';
import { useAppSelector, useAppDispatch } from './app/hooks';
import { AccountSlice } from 'zkwasm-minirollup-browser';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';

function App() {
  const dispatch = useAppDispatch();
  const l1account = useAppSelector(AccountSlice.selectL1Account);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  const [isLoading, setIsLoading] = useState(true);
  // 添加一个状态来跟踪钱包是否已连接但需要签名
  const [walletConnected, setWalletConnected] = useState(false);
  
  // 在组件加载时尝试恢复会话
  useEffect(() => {
    // 检查是否有保存的账户信息
    const hasSavedWalletInfo = localStorage.getItem('wallet_connected') === 'true';
    
    // 如果页面刷新但用户已经连接过钱包
    if (hasSavedWalletInfo && !l1account) {
      // 只恢复L1账户连接，但不自动恢复L2账户
      dispatch(AccountSlice.loginL1AccountAsync())
        .then((action) => {
          if (AccountSlice.loginL1AccountAsync.fulfilled.match(action) && action.payload) {
            // 标记钱包已连接，但需要用户在登录页面签名
            setWalletConnected(true);
          }
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [dispatch]);
  
  // 当账户状态改变时，更新localStorage
  useEffect(() => {
    if (l1account) {
      localStorage.setItem('wallet_connected', 'true');
      setWalletConnected(true);
    }
  }, [l1account]);
  
  // 显示主应用或登录页面
  const isFullyAuthenticated = l1account && l2account;
  
  // 如果正在加载用户信息，显示加载中的状态
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <div className="screen loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }
  
  return (
    <ThemeProvider theme={theme}>
      <div className="screen">
        {isFullyAuthenticated ? (
          <Main />
        ) : (
          <ConnectPage walletAlreadyConnected={walletConnected} />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
