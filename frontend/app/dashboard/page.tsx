"use client";

import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import useUserStore from "@/lib/store";

export default function DashboardPage() {
  const user = useUserStore((s) => s.user);

  if (!user) return <div>Please login first</div>;

  console.log("Dashboard user:", user);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <span>{user.Email}</span>
        </div>
      </div>
    </div>
  );
}

