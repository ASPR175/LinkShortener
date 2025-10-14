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

interface ReferrerData {
  referrer: string;
  clicks: number;
}

const ReferrerPage = () => {
  const params = useParams();
  const linkId = params.id as string;
  const { user, analytics } = useAppStore();
  const [referrers, setReferrers] = useState<ReferrerData[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferrer = async () => {
      if (!linkId || !user?.token) {
        setLoading(false);
        setError("The token or linkId may be missing");
        return;
      }
      try {
        setLoading(true);
        setError("");
        const cached = analytics[linkId];
        if (cached?.referrer) {
          setReferrers(cached.referrer);
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
          throw new Error(`Failed to fetch Data: ${res.status} = ${text}`);
        }

        const data = await res.json();
        const normalized: ReferrerData[] = (data.referrer || []).map((r: any) => ({
          referrer: r._id || "Direct",
          clicks: Number(r.count?.$numberInt ?? 0),
        }));
        setReferrers(normalized);
      } catch (err: any) {
        console.log("The Error occurred:", err);
        setError(err.message || "Failed to load Referrer data");
      } finally {
        setLoading(false);
      }
    };
    fetchReferrer();
  }, [linkId, user, analytics]);

  // Prepare data with random colors
  const coloredReferrers = referrers.map((r) => ({
    ...r,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
  }));

  if (loading)
    return (
      <div className="flex h-screen">
        <Sidebar />
        <Navbar />
        Loading referrers...
      </div>
    );
  if (error)
    return (
      <div className="flex h-screen">
        <Sidebar />
        <Navbar />
        {error}
      </div>
    );

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <div className="p-8 overflow-y-auto flex-1">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">🔗 Referrer Stats</h1>

          <div className="rounded-2xl shadow-lg border border-gray-100 bg-white p-6 mb-10">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={coloredReferrers}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="referrer" />
                <YAxis />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    border: "1px solid #eee",
                  }}
                />
                <Bar dataKey="clicks" radius={[8, 8, 0, 0]} isAnimationActive={true}>
                  {coloredReferrers.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coloredReferrers.map((r, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-100 shadow-md p-5 hover:scale-[1.03] transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${r.color}30, white)`,
                }}
              >
                <h2 className="text-lg font-semibold text-gray-800">{r.referrer}</h2>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {r.clicks} clicks
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferrerPage;
