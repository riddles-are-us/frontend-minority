import { useRef, useEffect, useState, useMemo, useCallback, memo } from "react"
import { Chart, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"
import { selectUserState, Nugget } from '../data/state';
import { AccountSlice, ConnectState } from "zkwasm-minirollup-browser";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import ChartDataLabels from "chartjs-plugin-datalabels"
import { createCommand } from "zkwasm-minirollup-rpc";
import { sendTransaction } from '../request';
import Loader from './Loader';
import { useTheme } from 'styled-components';
import { BUY_CARD } from '../request';
import styled from 'styled-components';
import { store } from '../app/store';

// Register required Chart.js components and plugins
Chart.register(ArcElement, Tooltip, ChartDataLabels)

// Custom styled container to match the theme
const ChartContainer = styled.div`
  background-color: ${props => props.theme.bgSecondary};
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
`;

const ChartTitle = styled.h2`
  color: ${props => props.theme.primary};
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
  
  @media (max-width: 768px) {
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
  }
`;

const ChartWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 550px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    height: 400px;
    margin-top: 0;
    margin-bottom: 0;
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  
  span {
    margin-left: 0.5rem;
    color: ${props => props.theme.success};
  }
`;

// 添加一个数据更新消息容器
const UpdateNotification = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: ${props => props.theme.success};
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  &.visible {
    opacity: 1;
  }
`;

// Add a styled badge for transaction complete message
const SuccessBadge = styled.div`
  background-color: ${props => props.theme.success};
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: inline-flex;
  align-items: center;
  
  &::before {
    content: "✓";
    display: inline-block;
    margin-right: 8px;
    font-weight: bold;
  }
  
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// Custom plugin to draw the center text
const centerTextPlugin = {
  id: "centerText",
  beforeDraw: (chart: any) => {
    const width = chart.width
    const height = chart.height
    const ctx = chart.ctx
    const theme = chart.options.plugins.centerText.theme
    const isMobile = width < 500 // 判断是否为移动设备

    ctx.restore()

    // Calculate total from the first dataset
    const dataset = chart.data.datasets[0]
    const rawTotal = dataset.data.reduce((sum: number, value: number) => sum + value, 0)
    // 从总数中减去26，确保显示的总数是实际值减去26
    const total = Math.max(0, rawTotal - 26)

    // Font size based on chart dimensions, smaller for mobile
    const fontSize = isMobile 
      ? Math.min(width, height) / 10 
      : Math.min(width, height) / 8
    const smallerFontSize = fontSize * (isMobile ? 0.5 : 0.6)

    // Draw background circle
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / (isMobile ? 6 : 5)

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fillStyle = theme.bgPrimary || "#ffffff"
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.fill()

    // Reset shadow for text
    ctx.shadowColor = "transparent"

    // Draw total number
    ctx.font = `bold ${fontSize}px Arial`
    ctx.fillStyle = theme.textPrimary || "#333333"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(total.toLocaleString(), centerX, centerY - smallerFontSize / 2)

    // Draw "TOTAL" label
    ctx.font = `${smallerFontSize}px Arial`
    ctx.fillText("TOTAL", centerX, centerY + fontSize / 2)

    ctx.save()
  },
}

// Register the custom plugin
Chart.register(centerTextPlugin)

// 函数用于比较两个数组是否相等
const arraysEqual = (a: number[], b: number[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

// 工具函数：深度比较对象是否相等
const deepEqual = (obj1: any, obj2: any): boolean => {
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
    
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};

// 包装Doughnut组件，避免不必要重渲染
const MemoizedDoughnut = memo(Doughnut, (prevProps, nextProps) => {
  // 如果数据相同，跳过重渲染
  return deepEqual(prevProps.data, nextProps.data) && 
         deepEqual(prevProps.options, nextProps.options);
});

export default function MultilevelPieChart() {
  const theme = useTheme();
  const userState = useAppSelector(selectUserState);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  const dispatch = useAppDispatch();
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const chartRef = useRef<any>(null);
  const [dataUpdated, setDataUpdated] = useState(false);
  const prevDataRef = useRef<number[]>([]);
  // 记录上次更新的时间戳
  const lastUpdateTimeRef = useRef<number>(Date.now());

  const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // 使用useMemo获取当前数据，添加优化
  const currentData = useMemo(() => {
    return userState?.state?.cards || [];
  }, [userState?.state?.cards]); // 更精确的依赖

  // 检查数据是否发生变化 - 添加节流逻辑
  useEffect(() => {
    const prevData = prevDataRef.current;
    
    // 添加时间节流，避免频繁更新
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 2000) { // 至少2秒更新一次
      return;
    }
    
    // 只有在有当前数据和之前数据都存在，且长度大于0的情况下才比较
    if (currentData.length > 0 && prevData.length > 0) {
      // 使用辅助函数比较数组
      const hasChanged = !arraysEqual(prevData, currentData);
      
      if (hasChanged) {
        lastUpdateTimeRef.current = now;
        setDataUpdated(true);
        // 3秒后自动隐藏更新通知
        setTimeout(() => {
          setDataUpdated(false);
        }, 3000);
      }
    }
    
    // 更新引用中保存的前一个状态
    if (currentData.length > 0) {
      prevDataRef.current = [...currentData];
    }
  }, [currentData]); // 只依赖于currentData

  // 更新图表数据 - 使用useMemo缓存数据，避免重复计算
  const memoizedChartData = useMemo(() => {
    if (!userState?.state?.cards) return null;
    
    const labels = userState.state.cards.map((_card:number, index:number) => LABELS[index]);
    
    // 实际数据不变，用于计算和交易
    const data = userState.state.cards.map((card:number) => card + 1);
        
    // Theme colors for chart segments
    const themeColors = [
      theme.primary,       // Main primary color
      theme.primaryLight,  // Light primary
      theme.primaryDark,   // Dark primary
      theme.secondary,     // Main secondary color
      theme.secondaryLight,// Light secondary
      theme.secondaryDark, // Dark secondary
      theme.accent,        // Accent color
      theme.accentLight,   // Light accent
      theme.accentDark     // Dark accent
    ];
    
    return {
      labels,
      datasets: [{
        data,
        // 保存原始数据，用于显示减1后的值
        originalData: data.map(value => value - 1),
        backgroundColor: themeColors.slice(0, data.length), // 确保颜色数组长度不超过数据长度
        borderColor: Array(data.length).fill("#ffffff"),
        borderWidth: 2,
      }],
    };
  }, [userState?.state?.cards, theme]); // 更精确的依赖
  
  // 使用effect根据memoized数据更新chart状态，避免不必要的重渲染
  useEffect(() => {
    if (memoizedChartData && !deepEqual(memoizedChartData, chartData)) {
      setChartData(memoizedChartData);
    }
  }, [memoizedChartData, chartData]);

  // 直接在handleChartClick中实现buyCard逻辑，确保每次都使用最新的nonce
  const handleChartClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // 移除useCallback，避免闭包捕获旧的userState
    if (!chartRef.current) return;
    
    // 重新获取最新的userState和l2account，确保使用最新的nonce
    const currentUserState = store.getState().state.userState;
    const currentL2Account = store.getState().account.l2account;
    
    if (!currentUserState?.player || !currentL2Account) {
      console.error("Chart - Missing user state or l2account");
      return;
    }
    
    const chart = chartRef.current;
    const activePoints = chart.getElementsAtEventForMode(
      event.nativeEvent,
      'nearest',
      { intersect: true },
      false
    );
    
    if (activePoints.length > 0) {
      const index = activePoints[0].index;
      setActiveSegment(index);
      
      // 内联buyCard逻辑，确保使用最新的nonce
      setIsLoading(true);
      
      // 直接从store获取最新的nonce，而不是依赖于组件的props或state
      const latestNonce = currentUserState.player.nonce;
      
      // 记录当前使用的nonce，便于调试
      console.log(`Chart - Using nonce: ${latestNonce} for index: ${index}`);
      
      const command = createCommand(BigInt(latestNonce), BUY_CARD, [BigInt(index), 1n]);
      
      dispatch(sendTransaction({cmd: command, prikey: currentL2Account.getPrivateKey()}))
        .then((action) => {
          if (sendTransaction.fulfilled.match(action)) {
            console.log("Chart - Transaction successful:", action);
            setIsLoading(false);
            setTransactionComplete(true);
            // After 2 seconds, hide the transaction complete message
            setTimeout(() => {
              setTransactionComplete(false);
            }, 2000);
          } else {
            console.error("Chart - Transaction failed:", action);
            setIsLoading(false);
          }
        })
        .catch(error => {
          console.error("Chart - Transaction error:", error);
          setIsLoading(false);
        });
    }
  };

  // Options for the chart
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    onClick: undefined, // We handle clicks in our custom handler
    plugins: {
      legend: {
        display: false,
      },
      centerText: {
        theme: theme
      },
      datalabels: {
        color: theme.textLight,
        formatter: (value: number, context: any) => {
          return context.chart.data.labels[context.dataIndex]
        },
        font: {
          weight: 'bold' as const,
          size: window.innerWidth < 768 ? 14 : 18
        },
        offset: 0,
        display: true
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            // 获取实际值
            const actualValue = context.raw;
            // 显示时减1
            const displayValue = actualValue - 1;
            const label = context.chart.data.labels[context.dataIndex];
            
            // 计算百分比时仍使用调整后的总数
            const rawTotal = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const adjustedTotal = Math.max(0, rawTotal - 26);
            
            // 使用显示值计算百分比
            const percentage = adjustedTotal > 0 ? Math.round((displayValue / adjustedTotal) * 100) : 0;
            
            // 返回减1后的显示值
            return `${label}: ${displayValue} (${percentage}%)`
          }
        }
      }
    },
  }), [theme]);

  return (
    <ChartContainer>
      <ChartTitle>Market Data</ChartTitle>
      <ChartWrapper>
        {chartData && (
          <>
            <MemoizedDoughnut 
              data={chartData} 
              options={options} 
              ref={chartRef}
              onClick={handleChartClick}
            />
            <UpdateNotification className={dataUpdated ? 'visible' : ''}>
              Data Updated
            </UpdateNotification>
          </>
        )}
        
        {/* Loading indicator or Transaction Complete */}
        {isLoading && (
          <LoaderContainer>
            <Loader />
          </LoaderContainer>
        )}
        
        {transactionComplete && (
          <LoaderContainer>
            <SuccessBadge>Transaction Complete!</SuccessBadge>
          </LoaderContainer>
        )}
      </ChartWrapper>
    </ChartContainer>
  )
}

