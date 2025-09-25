"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"
import useAppStore from "@/lib/store"

interface BrowserData {
  browser: string
  clicks: number
}

const BrowserPage = () => {
  const params = useParams()
  const linkId = params.id as string
  const { user, analytics } = useAppStore()
  const [browsers, setBrowsers] = useState<BrowserData[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBrowsers = async () => {
      if (!linkId || !user?.token) {
        setLoading(false)
        setError("The token or linkId may be missing")
        return
      }
      try {
        setLoading(true)
        setError("")
        const cached = analytics[linkId]
        if (cached?.browser) {
          setBrowsers(cached.browser)
          setLoading(false)
          return
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/links/${linkId}/summary`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        )

        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Failed to fetch the Data:${res.status} = ${text}`)
        }

        const data = await res.json()
        
        const normalized: BrowserData[] = (data.browser || []).map((b: any) => ({
          browser: b._id || "Unknown",
          clicks: Number(b.count?.$numberInt ?? 0),
        }))
       
        setBrowsers(normalized)
      } catch (err: any) {
        console.log("The Error occurred:", err)
        setError(err.message || "Failed to load browser data")
      } finally {
        setLoading(false)
      }
    }
    fetchBrowsers()
  }, [linkId, user, analytics])

  if (loading) return <div className="flex h-screen"><Sidebar /><Navbar />Loading browsers...</div>
  if (error) return <div className="flex h-screen"><Sidebar /><Navbar />{error}</div>

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <div className="p-6 overflow-y-auto flex-1">
          <h1 className="text-2xl font-bold mb-4">Browser Stats</h1>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-4 py-2 text-left">Browser</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {browsers.map((b, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">{b.browser}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">{b.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
export default BrowserPage
