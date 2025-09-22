"use client"
import { useState,useEffect } from "react"
import { useParams,useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"
import useAppStore from "@/lib/store"

interface ReferrerData{
referrer:string;
clicks:number
}
const ReferrerPage=()=>{
const router = useRouter()
const params = useParams()
const linkId = params.id as string
const {user,analytics} = useAppStore()
const [referrer,setreferrer] = useState<ReferrerData []>([])
const [error,seterror]= useState("")
const [loading,setloading] = useState(true)

useEffect(()=>{
    const fetchReferrer = async()=>{
        if (!linkId || !user?.token){
            setloading(false)
            seterror("The token or linkiD may be missing")
        return
        }
        try{
 setloading(true)
 seterror("")
 const GetReferrer = analytics[linkId]
 if (GetReferrer?.referrer) {
  setreferrer(GetReferrer.referrer) 
  setloading(false)
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
  
   if(!res.ok){
      const text = await res.text()
      throw new Error(`Failed to fetch the Data:${res.status} = ${text}`)
   }

const data = await res.json()

    const normalized: ReferrerData[] = (data.referrer || []).map((r:any) => ({
          referrer: r._id || "Direct",
          clicks: Number(r.count?.$numberInt ?? 0),
        }));
        setreferrer(normalized)
      
        }catch(err:any){
             console.log("The Error ocurred:",err)
             seterror(err.message || "Failed to load Referrer data")
        }finally{
               setloading(false)
        }
    }
    fetchReferrer()
    
},[linkId,user,analytics])

if (loading) return <div className="flex h-screen"><Sidebar /><Navbar />Loading referrers...</div>;
if (error) return <div className="flex h-screen"><Sidebar /><Navbar />{error}</div>;

return(
      <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <div className="p-6 overflow-y-auto flex-1">
          <h1 className="text-2xl font-bold mb-4">Referrer Stats</h1>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-4 py-2 text-left">Referrer</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {referrer.map((r, idx) => (
                
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">{r.referrer}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">{r.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
)
}
export default ReferrerPage