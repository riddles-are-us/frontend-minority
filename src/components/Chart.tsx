import { useRef, useEffect, useState } from "react"
import { Chart, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"
import { selectUserState, Nugget } from '../data/state';
import { AccountSlice, ConnectState } from "zkwasm-minirollup-browser";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import ChartDataLabels from "chartjs-plugin-datalabels"

// Register required Chart.js components and plugins
Chart.register(ArcElement, Tooltip, ChartDataLabels)

// Custom plugin to draw the center text
const centerTextPlugin = {
  id: "centerText",
  beforeDraw: (chart: any) => {
    const width = chart.width
    const height = chart.height
    const ctx = chart.ctx

    ctx.restore()

    // Calculate total from the first dataset
    const dataset = chart.data.datasets[0]
    const total = dataset.data.reduce((sum: number, value: number) => sum + value, 0)

    // Font size based on chart dimensions
    const fontSize = Math.min(width, height) / 10
    const smallerFontSize = fontSize * 0.6

    // Draw background circle
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 6

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fillStyle = "#ffffff"
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.fill()

    // Reset shadow for text
    ctx.shadowColor = "transparent"

    // Draw total number
    ctx.font = `bold ${fontSize}px Arial`
    ctx.fillStyle = "#333333"
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

export default function MultilevelPieChart() {
  const userState = useAppSelector(selectUserState);
  const l2account = useAppSelector(AccountSlice.selectL2Account);
  const dispatch = useAppDispatch();
  const [chartData, setChartData] = useState<any>(null);

  const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  useEffect(() => {
      if (userState) {
          let labels = userState!.state.cards.map((_card:number, index:number) => {
                  return LABELS[index]
              });
          let data = userState!.state.cards.map((card:number, index:number) => {
                  return card + 1
              });
          const dataset = {
              labels: labels,
              datasets: [{
                data: data,
                backgroundColor: [
                "#818cf8", // A1
                "#6366f1", // A2
                "#38bdf8", // B1
                "#0284c7", // B2
                "#a78bfa", // C1
                "#7c3aed", // C2
                "#6d28d9", // C3
                ],
                borderColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"],
                borderWidth: 2,
              }],
          }
          setChartData(dataset);
       }
  }, [userState]);


  const chartRef = useRef(null)
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  const handleChartClick = (event: any, elements: any[], chart: any) => {
    if (elements.length > 0) {
      const { datasetIndex, index } = elements[0]

      // Check if it's the inner chart (datasetIndex 0) and the first segment (Category A)
      if (datasetIndex === 0) {
          alert(`You clicked on ${index}`)
      }
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Options for the outer chart
  const outerOptions = {
    responsive: true,
    cutout: "75%",
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        color: "#ffffff",
        //font:,
        //textAlign: "center",
        formatter: (value: number, context: any) => {
          return context.chart.data.labels[context.dataIndex]
        },
        //anchor: "center",
        // align: "center",
        // Adjust label position to be in the middle of the segment
        offset: 0,
        display: (context: any) => {
            return true;
        // Only display if segment is large enough
            //return context.dataset.data[context.dataIndex] > 50
        },
      },

      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || ""
            const value = context.raw || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = Math.round((value / total) * 100)
            return `${label}: ${value} (${percentage}%)`
          },
        },
      },
    onClick: handleChartClick,
    onHover: (event: any, elements: any[]) => {
      event.native.target.style.cursor = "pointer"
      }
    },
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-center">Sales Distribution by Category</h2>
      <div className="relative">
        {/* Outer chart */}
        <div className="absolute z-10">
          {chartData &&
          <Doughnut data={chartData} options={outerOptions} />
          }
        </div>
      </div>
    </div>
  )
}

