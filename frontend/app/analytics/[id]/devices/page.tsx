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

interface DeviceData {
  device: string;
  clicks: number;
}

const DevicePage = () => {
  const params = useParams();
  const linkId = params.id as string;
  const { user, analytics } = useAppStore();
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      if (!linkId || !user?.token) {
        setLoading(false);
        setError("The token or linkId may be missing");
        return;
      }
      try {
        setLoading(true);
        setError("");
        const cached = analytics[linkId];
        if (cached?.device) {
          setDevices(cached.device);
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
        const normalized: DeviceData[] = (data.device || []).map((d: any) => ({
          device: d._id || "Unknown",
          clicks: Number(d.count?.$numberInt ?? 0),
        }));
        setDevices(normalized);
      } catch (err: any) {
        console.log("The Error occurred:", err);
        setError(err.message || "Failed to load device data");
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, [linkId, user, analytics]);

  // Prepare data with random colors for bars
  const coloredDevices = devices.map((d) => ({
    ...d,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
  }));

  if (loading)
    return (
      <div className="flex h-screen">
        <Sidebar />
        <Navbar />
        Loading devices...
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
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            📱 Device Stats
          </h1>

          <div className="rounded-2xl shadow-lg border border-gray-100 bg-white p-6 mb-10">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={coloredDevices}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="device" />
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
                  {coloredDevices.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coloredDevices.map((d, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-100 shadow-md p-5 hover:scale-[1.03] transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${d.color}30, white)`,
                }}
              >
                <h2 className="text-lg font-semibold text-gray-800">{d.device}</h2>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {d.clicks} clicks
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicePage;



