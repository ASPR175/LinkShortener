"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Globe, Link as LinkIcon, Smartphone, Monitor } from "lucide-react";

interface AnalyticsData {
  clicks: number;
  uniqueClicks: number;
  country: { country: string; clicks: number }[];
  referrer: { referrer: string; clicks: number }[];
  device: { device: string; clicks: number }[];
  browser: { browser: string; clicks: number }[];
  timestamp: { date: string; clicks: number; uniqueClicks: number }[];
}

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
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
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch analytics: ${res.status} - ${errorText}`);
        }

        const data = await res.json();

        const analyticsData: AnalyticsData = {
          clicks: data.clicks || 0,
          uniqueClicks: data.uniqueClicks || 0,
          country: data.country || [],
          referrer: data.referrer || [],
          device: data.device || [],
          browser: data.browser || [],
          timestamp: (data.timestamp || []).map((t: any) => ({
            date: t.date,
            clicks: t.clicks,
            uniqueClicks: t.uniqueClicks,
          })),
        };

        setAnalytics(linkId, analyticsData);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [linkId, user, setAnalytics]);

  const linkAnalytics = analytics[linkId];
  const timeSeriesData = (linkAnalytics?.timestamp || []).map((t) => ({
    date: t.date,
    clicks: t.clicks,
    uniqueClicks: t.uniqueClicks,
  }));

  if (!user) return <div>Please login first</div>;

  if (loading)
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Navbar />
          <div className="flex items-center justify-center flex-1 text-lg">
            Loading analytics...
          </div>
        </div>
      </div>
    );

  if (error || !linkAnalytics)
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

  const cards = [
    {
      title: "Countries",
      value: linkAnalytics.country.length,
      icon: <Globe className="w-6 h-6 text-white" />,
      color: "from-blue-400 to-blue-600",
      route: `/analytics/${linkId}/countries`,
    },
    {
      title: "Referrers",
      value: linkAnalytics.referrer.length,
      icon: <LinkIcon className="w-6 h-6 text-white" />,
      color: "from-green-400 to-green-600",
      route: `/analytics/${linkId}/referrers`,
    },
    {
      title: "Devices",
      value: linkAnalytics.device.length,
      icon: <Smartphone className="w-6 h-6 text-white" />,
      color: "from-purple-400 to-purple-600",
      route: `/analytics/${linkId}/devices`,
    },
    {
      title: "Browsers",
      value: linkAnalytics.browser.length,
      icon: <Monitor className="w-6 h-6 text-white" />,
      color: "from-orange-400 to-orange-600",
      route: `/analytics/${linkId}/browsers`,
    },
  ];

  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Link Analytics</h1>
            <p className="text-gray-500">Track your link performance over time</p>
          </div>

        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-blue-50 rounded-2xl p-6 flex flex-col items-center justify-center shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold mb-2">Total Clicks</h3>
              <p className="text-3xl font-bold text-blue-600">{linkAnalytics.clicks}</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-green-50 rounded-2xl p-6 flex flex-col items-center justify-center shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold mb-2">Unique Visitors</h3>
              <p className="text-3xl font-bold text-green-600">{linkAnalytics.uniqueClicks}</p>
            </motion.div>
          </div>

          
          <div className="bg-gray-50 rounded-2xl shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Clicks Over Time</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                    stroke="#3b82f6"
                    fill="url(#colorClicks)"
                    strokeWidth={2}
                    dot={false}
                    name="Total Clicks"
                  />
                  <Line
                    type="monotone"
                    dataKey="uniqueClicks"
                    stroke="#10b981"
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
            {cards.map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -3 }}
                className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center shadow hover:shadow-lg transition cursor-pointer border border-gray-100"
                onClick={() => router.push(card.route)}
              >
                <div className={`p-3 rounded-full bg-gradient-to-tr ${card.color} shadow-md mb-3`}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
                <p className="text-gray-500 mb-2 text-sm">{card.value} items</p>
                <button className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                  View Details
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}




