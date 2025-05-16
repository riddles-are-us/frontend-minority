import React from 'react';
import { Main } from './layout/Main';
import ConnectPage from './ConnectPage';
import './App.css';
import { useAppSelector } from './app/hooks';
import { AccountSlice } from 'zkwasm-minirollup-browser';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';

function App() {
  const l1account = useAppSelector(AccountSlice.selectL1Account);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  
  // Show the main app only if user is both connected and logged in
  const isFullyAuthenticated = l1account && l2account;
  
  return (
    <ThemeProvider theme={theme}>
      <div className="screen">
        {isFullyAuthenticated ? <Main /> : <ConnectPage />}
      </div>
    </ThemeProvider>
  );
}

export default App;
