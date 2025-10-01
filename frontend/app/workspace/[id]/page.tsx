"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useAppStore from "@/lib/store";
import Link from "next/link";
import Sidebar from "@/components/sidebar";

type LinkItem = {
  _id: string;
  short_id: string;
  original: string;
  clicks: number;
};

type Workspace = {
  _id: string;
  name: string;
  links: LinkItem[];
};

export default function WorkspacePage() {
  const { id } = useParams();
  const { setLinks, setCurrentWorkspace } = useAppStore();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const token = useAppStore.getState().user?.token;

  useEffect(() => {
    async function fetchWorkspace() {
      if (!id) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        const normalized: Workspace = {
          _id: data.workspace?.ID ?? data.workspace?.id,
          name: data.workspace?.Name ?? data.workspace?.name,
          links:
            data.workspace?.links?.map((l: any) => ({
              _id: l.ID ?? l.id,
              short_id: l.ShortID ?? l.shortid,
              original: l.Original ?? l.original,
              clicks: l.Clicks ?? l.clicks ?? 0,
            })) ?? [],
        };

        setWorkspace(normalized);
        setLinks(normalized.links);
        setCurrentWorkspace(normalized._id);
      } catch (err) {
        console.error("Failed to fetch workspace", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkspace();
  }, [id, setLinks, setCurrentWorkspace, token]);

  if (loading) return <div className="p-6">Loading workspace...</div>;
  if (!workspace) return <div className="p-6">Workspace not found</div>;

return (
  <div className="flex h-screen">
    {/* Sidebar */}
    <Sidebar />

    {/* Main Workspace Content */}
    <div className="p-6 flex-1 overflow-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{workspace.name}</h1>
        <Link
          href={`/workspace/${workspace._id}/members`}
          className="text-blue-600 underline"
        >
          View Members →
        </Link>
      </div>

      {/* Links */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Links</h2>
        <ul className="space-y-1">
          {workspace.links.map((link) => (
            <li key={link._id} className="text-sm">
              <span className="font-mono">{link.short_id}</span> →{" "}
              <span className="text-blue-600">{link.original}</span>{" "}
              <span className="text-gray-500">({link.clicks} clicks)</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

}


