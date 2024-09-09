"use client"

import {useState, useEffect} from "react"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), {ssr: false})

interface VideoData {
  published_at: string;
  view_count: number;
}

interface ChannelData {
  id: string;
  videos: VideoData[];
}

interface ViewCountChartProps {
  channelsData: ChannelData[];
}

const ViewCountChart: React.FC<ViewCountChartProps> = ({channelsData}) => {
  const [options, setOptions] = useState({})
  const [series, setSeries] = useState([])

  useEffect(() => {
    const seriesData = channelsData.map(channel => {
      const sortedData = channel.videos.sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime())
      return {
        name: channel.id,
        data: sortedData.map(item => ({
          x: new Date(item.published_at).getTime(),
          y: item.view_count
        }))
      }
    })

    setOptions({
      chart: {
        id: "view-count-chart",
        type: "line"
      },
      xaxis: {
        type: "datetime",
        labels: {
          datetimeFormatter: {
            year: "yyyy",
            month: "MM/yyyy",
            day: "dd/MM"
          }
        }
      },
      yaxis: {
        title: {
          text: "View Count"
        }
      },
      title: {
        text: "Video View Count Over Time",
        align: "center"
      },
      tooltip: {
        x: {
          format: "dd/MM/yyyy"
        }
      },
      legend: {
        position: "top"
      }
    })

    setSeries(seriesData)
  }, [channelsData])

  return (
    <div>
      {typeof window !== "undefined" && (
        <Chart
          options={options}
          series={series}
          type="line"
          height={350}
        />
      )}
    </div>
  )
}

export default ViewCountChart