"use client";

import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <div className="p-4">
          <h1 className="text-lg font-bold">Links (coming soon)</h1>
        </div>
      </div>
    </div>
  );
}