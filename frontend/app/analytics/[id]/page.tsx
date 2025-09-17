// app/analytics/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import useAppStore from "@/lib/store";

interface AnalyticsData {
  totalClicks: number;
  countryStats: { country: string; count: number }[];
  referrerStats: { referrer: string; count: number }[];
  deviceStats: { device: string; count: number }[];
  browserStats: { browser: string; count: number }[];
}

export default function AnalyticsPage() {
  const params = useParams();
  const linkId = params.id as string;
  const { user, analytics, setAnalytics } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          countryStats: data.by_country?.map((item: any) => ({
            country: item._id || "Unknown",
            count: item.count || 0
          })) || [],
          referrerStats: data.by_referrer?.map((item: any) => ({
            referrer: item._id || "Direct",
            count: item.count || 0
          })) || [],
          deviceStats: data.by_device?.map((item: any) => ({
            device: item._id || "Unknown",
            count: item.count || 0
          })) || [],
          browserStats: data.by_browser?.map((item: any) => ({
            browser: item._id || "Unknown",
            count: item.count || 0
          })) || [],
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

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Navbar />
          <div className="flex items-center justify-center flex-1">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error: {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!linkAnalytics) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Navbar />
          <div className="flex items-center justify-center flex-1">
            <div className="text-lg">No analytics data found for this link</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Link Analytics</h1>
          
         
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">Total Clicks</h3>
                <p className="text-3xl font-bold text-blue-600">{linkAnalytics.totalClicks}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800">Unique Countries</h3>
                <p className="text-3xl font-bold text-green-600">{linkAnalytics.countryStats.length}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-800">Browsers</h3>
                <p className="text-3xl font-bold text-purple-600">{linkAnalytics.browserStats.length}</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-orange-800">Devices</h3>
                <p className="text-3xl font-bold text-orange-600">{linkAnalytics.deviceStats.length}</p>
              </div>
            </div>
          </div>

          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Top Countries</h2>
              <div className="space-y-2">
                {linkAnalytics.countryStats.slice(0, 5).map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{stat.country}</span>
                    <span className="text-gray-600">{stat.count} clicks</span>
                  </div>
                ))}
              </div>
            </div>

           
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Top Browsers</h2>
              <div className="space-y-2">
                {linkAnalytics.browserStats.slice(0, 5).map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{stat.browser}</span>
                    <span className="text-gray-600">{stat.count} clicks</span>
                  </div>
                ))}
              </div>
            </div>

           
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Devices</h2>
              <div className="space-y-2">
                {linkAnalytics.deviceStats.map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{stat.device}</span>
                    <span className="text-gray-600">{stat.count} clicks</span>
                  </div>
                ))}
              </div>
            </div>

            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Top Referrers</h2>
              <div className="space-y-2">
                {linkAnalytics.referrerStats.slice(0, 5).map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium truncate max-w-xs">{stat.referrer || "Direct"}</span>
                    <span className="text-gray-600">{stat.count} clicks</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}