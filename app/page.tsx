"use client"

import {NextPage} from "next"
import {useEffect, useState} from "react"
import {db} from "@/lib/firebase"
import {doc, collection, getDocs, query, orderBy} from "firebase/firestore"
import ViewCountChart from "@/components/ViewCountChart"

const Page: NextPage = () => {
  const [channelsData, setChannelsData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const formatDate = (seconds: number) => {
    const date = new Date(seconds * 1000)
    return date.toISOString().split("T")[0] // YYYY-MM-DD形式
  }

  useEffect(() => {
    const fetchChannelData = async (channelId: string) => {
      const channelDoc = doc(db, "channels", channelId)
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

      return {id: channelId, videos: videosData}
    }

    const fetchData = async () => {
      try {
        console.log("Fetching data...")
        const channelIds = [
          "UCYTximhpSat0HHFPAI0UpUA",
          "UCxBR2bnAFAavDHpHtQrTA9Q",
          "UCsZIVV29dmXPrvItQeaDKJQ",
          "UC1ax6Oh62fiv2Q7L51bSvYQ",
          "UCDgibsAF-DG37dnd9FTpfoQ"
        ]
        const channelsData = await Promise.all(channelIds.map(fetchChannelData))

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
    <>
      {channelsData.length > 0 ? (
        <ViewCountChart channelsData={channelsData}/>
      ) : (
        <div>Loading channels data...</div>
      )}
    </>
  )
}

export default Page