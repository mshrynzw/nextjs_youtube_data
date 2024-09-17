"use client"

import {NextPage} from "next"
import {useEffect, useState} from "react"
import {db} from "@/lib/firebase"
import {doc, collection, getDocs, query, orderBy} from "firebase/firestore"
import ViewCountChart from "@/components/ViewCountChart"
import LikeCountChart from "@/components/LikeCountChart"
import LikeViewCountChart from "@/components/LikeViewCountChart"

interface Channel {
  id: string;
  name: string;
}

interface VideoData {
  id: string;
  published_at: string;
  view_count: number;
  like_count: number;
}

interface ChannelData extends Channel {
  videos: VideoData[];
}

const Page: NextPage = () => {
  const [selectChart, setSelectChart] = useState<string>("like_view")
  const [channelsData, setChannelsData] = useState<ChannelData[]>([])
  const [error, setError] = useState<string | null>(null)

  const formatDate = (seconds: number) => {
    const date = new Date(seconds * 1000)
    return date.toISOString().split("T")[0] // YYYY-MM-DD形式
  }

  useEffect(() => {
    const fetchChannelData = async (channel: Channel): Promise<ChannelData> => {
      const channelDoc = doc(db, "channels", channel.id)
      const videosCollection = collection(channelDoc, "videos")

      const q = query(videosCollection, orderBy("published_at", "asc"))

      const videosSnapshot = await getDocs(q)

      const videosData = videosSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          published_at: formatDate(data.published_at.seconds),
          view_count: data.view_count,
          like_count: data.like_count
        }
      })

      return {...channel, videos: videosData}
    }

    const fetchData = async () => {
      try {
        console.log("Fetching data...")
        const channels: Channel[] = [
          {id: "UCYTximhpSat0HHFPAI0UpUA", name: "西園寺"},
          {id: "UCxBR2bnAFAavDHpHtQrTA9Q", name: "スーツ 交通 / Suit Train"},
          {id: "UCsZIVV29dmXPrvItQeaDKJQ", name: "ひろき / 鉄道Channel"},
          {id: "UC1ax6Oh62fiv2Q7L51bSvYQ", name: "謎のちゃんねる"},
          {id: "UCDgibsAF-DG37dnd9FTpfoQ", name: "がみ"}
        ]
        const channelsData = await Promise.all(channels.map(fetchChannelData))

        console.log("Channels data:", channelsData)
        setChannelsData(channelsData)

        if (channelsData.some(channel => channel.videos.length === 0)) {
          console.log("No documents found in one or more channels")
        }
      } catch (error) {
        console.error("Error getting documents:", error)
        setError("Error fetching data. Please check console for details.")
      }
    }

    fetchData()
  }, [])

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="h-screen flex flex-col">
      {channelsData.length > 0 ? (
        <div className="h-screen flex flex-col">
          <nav className="flex flex-row w-full px-8 py-4 space-x-8">
            <button
              className="mr-1 mb-1 w-full rounded-xl bg-gray-200 p-2 px-6 py-3 text-sm font-bold uppercase shadow-xl outline-none duration-300 ease-in-out text-blueGray-600 bg-blueGray-800 hover:text-blueGray-200 hover:bg-blueGray-600 hover:-translate-y-1 hover:scale-110 focus:outline-none"
              onClick={() => setSelectChart("view")}
            >
              視聴回数
            </button>
            <button
              className="mr-1 mb-1 w-full rounded-xl bg-gray-200 p-2 px-6 py-3 text-sm font-bold uppercase shadow-xl outline-none duration-300 ease-in-out text-blueGray-600 bg-blueGray-800 hover:text-blueGray-200 hover:bg-blueGray-600 hover:-translate-y-1 hover:scale-110 focus:outline-none"
              onClick={() => setSelectChart("like")}
            >
              高評価数
            </button>
            <button
              className="mr-1 mb-1 w-full rounded-xl bg-gray-200 p-2 px-6 py-3 text-sm font-bold uppercase shadow-xl outline-none duration-300 ease-in-out text-blueGray-600 bg-blueGray-800 hover:text-blueGray-200 hover:bg-blueGray-600 hover:-translate-y-1 hover:scale-110 focus:outline-none"
              onClick={() => setSelectChart("like_view")}
            >
              高評価 / 視聴回数
            </button>
          </nav>

          <div className="flex-1 min-h-0">
            {selectChart === "view" ? (
              <ViewCountChart channelsData={channelsData}/>
            ) : selectChart === "like" ? (
              <LikeCountChart channelsData={channelsData}/>
            ) : (
              <LikeViewCountChart channelsData={channelsData}/>
            )}
          </div>
        </div>
      ) : (
        <div>Loading channels data...</div>
      )}
    </div>
  )
}

export default Page