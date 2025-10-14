"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { useAppStore } from "@/lib/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { Globe2, Loader2 } from "lucide-react";

interface BrowserData {
  browser: string;
  clicks: number;
}

const BrowserPage = () => {
  const params = useParams();
  const linkId = params.id as string;
  const { user, analytics } = useAppStore();
  const [browsers, setBrowsers] = useState<BrowserData[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrowsers = async () => {
      if (!linkId || !user?.token) {
        setLoading(false);
        setError("Missing token or link ID.");
        return;
      }
      try {
        setLoading(true);
        setError("");
        const cached = analytics[linkId];
        if (cached?.browser) {
          setBrowsers(cached.browser);
          setLoading(false);
          return;
        }

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
          const text = await res.text();
          throw new Error(`Failed to fetch: ${res.status} = ${text}`);
        }

        const data = await res.json();
        const normalized: BrowserData[] = (data.browser || []).map((b: any) => ({
          browser: b._id || "Unknown",
          clicks: Number(b.count?.$numberInt ?? 0),
        }));

        setBrowsers(normalized);
      } catch (err: any) {
        setError(err.message || "Failed to load browser data");
      } finally {
        setLoading(false);
      }
    };

    fetchBrowsers();
  }, [linkId, user, analytics]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-white text-gray-700">
        <Loader2 className="animate-spin mr-2 h-6 w-6" />
        Fetching browser analytics...
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center bg-white text-red-500 font-medium">
        {error}
      </div>
    );

  const totalClicks = browsers.reduce((sum, b) => sum + b.clicks, 0);
  const coloredBrowsers = browsers.map((b) => ({
    ...b,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
  }));

  return (
    <div className="flex h-screen bg-white text-gray-800">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <div className="p-8 overflow-y-auto flex-1 space-y-8">
          <div className="flex items-center gap-3">
            <Globe2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight">Browser Analytics</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-100 shadow-md p-6 bg-gradient-to-br from-blue-50 to-white hover:scale-[1.02] transition-all">
              <p className="text-sm text-gray-500 mb-1">Total Clicks</p>
              <p className="text-3xl font-bold text-gray-900">{totalClicks}</p>
            </div>

            <div className="rounded-2xl border border-gray-100 shadow-md p-6 bg-gradient-to-br from-green-50 to-white hover:scale-[1.02] transition-all">
              <p className="text-sm text-gray-500 mb-1">Top Browser</p>
              <p className="text-3xl font-bold text-gray-900">
                {browsers[0]?.browser || "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 shadow-md p-6 bg-gradient-to-br from-purple-50 to-white hover:scale-[1.02] transition-all">
              <p className="text-sm text-gray-500 mb-1">Unique Browsers</p>
              <p className="text-3xl font-bold text-gray-900">{browsers.length}</p>
            </div>
          </div>

          <div className="rounded-2xl shadow-lg border border-gray-100 bg-white p-6 mb-10">
            <h2 className="text-xl font-semibold mb-4">Browser Distribution</h2>
            {browsers.length > 0 ? (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={coloredBrowsers}
                    margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="browser" />
                    <YAxis />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "10px",
                        border: "1px solid #eee",
                      }}
                    />
                    <Bar dataKey="clicks" radius={[8, 8, 0, 0]} isAnimationActive>
                      {coloredBrowsers.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No data available</p>
            )}
          </div>

          <div className="bg-white border border-gray-100 shadow-md rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-6 py-3 text-sm font-medium text-gray-600">
                    Browser
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-600 text-right">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-600 text-right">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {browsers.map((b, idx) => {
                  const percent = totalClicks
                    ? ((b.clicks / totalClicks) * 100).toFixed(1)
                    : 0;
                  return (
                    <tr
                      key={idx}
                      className="border-t hover:bg-gray-50 transition-all duration-200"
                    >
                      <td className="px-6 py-3 font-medium">{b.browser}</td>
                      <td className="px-6 py-3 text-right">{b.clicks}</td>
                      <td className="px-6 py-3 text-right text-gray-500">
                        {percent}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserPage;


