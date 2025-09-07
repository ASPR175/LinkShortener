"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-48 border-r h-screen p-4 flex flex-col space-y-4">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/analytics">Analytics</Link>
      <Link href="/links">Links</Link>
    </div>
  );
}
