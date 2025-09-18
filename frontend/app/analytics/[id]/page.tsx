
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import useAppStore from "@/lib/store";

interface AnalyticsData {
  totalClicks: number;
  uniqueIps: number;
  countryStats: { country: string; count: number }[];
  referrerStats: { referrer: string; count: number }[];
  deviceStats: { device: string; count: number }[];
  browserStats: { browser: string; count: number }[];
  timestamp: {date: string;count:number; uniqueClicks: number}[];
}


const generateTimeSeriesData = (totalClicks: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    
    const clicks = Math.floor(Math.random() * 20) + 5;
    const uniqueClicks = Math.floor(clicks * 0.7);
    
    data.push({
      date: date.toLocaleDateString(),
      clicks: clicks,
      uniqueClicks: uniqueClicks,
    });
  }
  
  return data;
};

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = params.id as string;
  const { user, analytics, setAnalytics } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
console.log(analytics)
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!linkId || !user?.token) {
        setError("Link ID or user token missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/links/${linkId}/summary`,
          {
            headers: { 
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json"
            },
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch analytics: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        
        const analyticsData: AnalyticsData = {
          totalClicks: data.total_clicks || 0,
          uniqueIps: data.unique_ips || 0,
          countryStats: data.by_country || [],
          referrerStats: data.by_referrer || [],
          deviceStats: data.by_device || [],
          browserStats: data.by_browser || [],
       timestamp: (data.time_series || []).map((t: any) => ({
  date: t.date,
  clicks: t.count,
  uniqueClicks: t.uniqueClicks,
})),

        };

        setAnalytics(linkId, analyticsData);
      } catch (err: any) {
        console.error("Analytics fetch error:", err);
        setError(err.message || "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [linkId, user, setAnalytics]);

  const linkAnalytics = analytics[linkId];
console.log(linkAnalytics)
const timeSeriesData = (linkAnalytics?.timestamp || []).map((t) => ({
  date: t.date,
  clicks: t.count,
  uniqueClicks: t.uniqueClicks,
}));




  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Navbar />
          <div className="flex items-center justify-center flex-1">
            <div className="text-lg">Loading analytics...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !linkAnalytics) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Navbar />
          <div className="flex items-center justify-center flex-1">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error || "No analytics data available"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        
        <div className="flex-1 overflow-y-auto p-6">
         
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Link Analytics</h1>
            <p className="text-gray-600">Track your link performance over time</p>
          </div>

         
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Clicks</h3>
              <p className="text-3xl font-bold text-blue-600">{linkAnalytics.totalClicks}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Unique Visitors</h3>
              <p className="text-3xl font-bold text-green-600">{linkAnalytics.uniqueIps}</p>
            </div>
          </div>

        
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Clicks Over Time</h2>
            <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
  <LineChart data={timeSeriesData}>
    <defs>
      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
      </linearGradient>
      <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6b7280" }} />
    <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
    <Tooltip />
    <Legend />
    <Line 
      type="monotone" 
      dataKey="clicks" 
      stroke="#8884d8" 
      fill="url(#colorClicks)" 
      strokeWidth={2}
      dot={false}
      name="Total Clicks"
    />
    <Line 
      type="monotone" 
      dataKey="uniqueClicks" 
      stroke="#82ca9d" 
      fill="url(#colorUnique)" 
      strokeWidth={2}
      dot={false}
      name="Unique Clicks"
    />
  </LineChart>
</ResponsiveContainer>

            </div>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div 
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/analytics/${linkId}/countries`)}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🌍</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Countries</h3>
                <p className="text-gray-600 mb-4">{linkAnalytics.countryStats.length} countries</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>

            
            <div 
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/analytics/${linkId}/referrers`)}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🔗</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Referrers</h3>
                <p className="text-gray-600 mb-4">{linkAnalytics.referrerStats.length} sources</p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>

            
            <div 
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/analytics/${linkId}/devices`)}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">📱</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Devices</h3>
                <p className="text-gray-600 mb-4">{linkAnalytics.deviceStats.length} types</p>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>

        
            <div 
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/analytics/${linkId}/browsers`)}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🌐</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Browsers</h3>
                <p className="text-gray-600 mb-4">{linkAnalytics.browserStats.length} browsers</p>
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}