"use client"

import {NextPage} from "next"
import {useEffect, useState} from "react"
import {db} from "@/lib/firebase"
import {doc, collection, getDocs, query, orderBy} from "firebase/firestore"
import ViewCountChart from "@/components/ViewCountChart"
import LikeCountChart from "@/components/LikeCountChart"

interface Channel {
  id: string;
  name: string;
}

const Page: NextPage = () => {
  const [channelsData, setChannelsData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const formatDate = (seconds: number) => {
    const date = new Date(seconds * 1000)
    return date.toISOString().split("T")[0] // YYYY-MM-DD形式
  }

  useEffect(() => {
    const fetchChannelData = async (channel: Channel) => {
      const channelDoc = doc(db, "channels", channel.id)
      const videosCollection = collection(channelDoc, "videos")

      const q = query(videosCollection, orderBy("published_at", "asc"))

      const videosSnapshot = await getDocs(q)

      const videosData = videosSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          published_at: formatDate(data.published_at.seconds)
        }
      })

      return {...channel, videos: videosData}
    }

    const fetchData = async () => {
      try {
        console.log("Fetching data...")
        const channels = [
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
        <>
           <div className="flex-1 min-h-0">
            <ViewCountChart channelsData={channelsData}/>
            {/*<LikeCountChart channelsData={channelsData}/>*/}
          </div>
          {/* 必要に応じて、スクロール可能な領域にチャンネルデータの詳細を表示 */}
        </>
      ) : (
        <div>Loading channels data...</div>
      )}
    </div>
  )
}

export default Page