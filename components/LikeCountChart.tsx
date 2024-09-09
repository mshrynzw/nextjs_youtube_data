"use client"

import {useState, useEffect, useRef} from "react"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), {ssr: false})

interface VideoData {
  published_at: string;
  like_count: number;
}

interface ChannelData {
  id: string;
  name: string;
  videos: VideoData[];
}

interface LikeCountChartProps {
  channelsData: ChannelData[];
}

const LikeCountChart: React.FC<LikeCountChartProps> = ({channelsData}) => {
  const [options, setOptions] = useState({})
  const [series, setSeries] = useState([])
  const [chartHeight, setChartHeight] = useState('100vh')
  const chartRef = useRef(null)

  useEffect(() => {
    const updateChartHeight = () => {
      if (chartRef.current) {
        const windowHeight = window.innerHeight
        const chartTop = chartRef.current.offsetTop
        const newHeight = windowHeight - chartTop - 20 // 20pxのマージンを追加
        setChartHeight(`${newHeight}px`)
      }
    }

    updateChartHeight()
    window.addEventListener('resize', updateChartHeight)

    return () => {
      window.removeEventListener('resize', updateChartHeight)
    }
  }, [])

  useEffect(() => {
    const seriesData = channelsData.map(channel => {
      const sortedData = channel.videos.sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime())
      return {
        name: channel.name,
        data: sortedData.map(item => ({
          x: new Date(item.published_at).getTime(),
          y: item.like_count
        }))
      }
    })

    setOptions({
      chart: {
        id: "like-count-chart",
        type: "line",
        zoom: {
          enabled: true,
          type: "x",
          autoScaleYaxis: true
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          formatter: function(val, timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' });
          }
        },
        tickAmount: 6,
      },
      yaxis: {
        title: {
          text: "Like Count"
        },
        labels: {
          formatter: function(val) {
            return val.toLocaleString();
          }
        }
      },
      title: {
        text: "鉄道系YouTuber視聴回数",
        align: "center"
      },
      tooltip: {
        x: {
          format: "yyyy年MM月"
        }
      },
      legend: {
        position: "top"
      },
      stroke: {
        curve: "smooth"
      },
      markers: {
        size: 0
      }
    })

    setSeries(seriesData)
  }, [channelsData])

  return (
    <div ref={chartRef} style={{ width: "100%", height: chartHeight }}>
      {typeof window !== "undefined" && (
        <Chart
          options={options}
          series={series}
          type="line"
          width="100%"
          height="100%"
        />
      )}
    </div>
  )
}

export default LikeCountChart