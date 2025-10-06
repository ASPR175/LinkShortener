"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import {useAppStore} from "@/lib/store";
import { Link as LinkType } from "@/lib/types";

export default function LinksPage() {
  const router = useRouter();
  const { user, links, setLinks, removeLink, addOrUpdateLink } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newLink, setNewLink] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");




 
  useEffect(() => {
    if (!user?.token) return;

    const fetchLinks = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/links`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        const data: LinkType[] = await res.json();
        setLinks(Array.isArray(data) ? data : [])
      } catch (err: any) {
        setError(err.message || "Failed to fetch links");
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [user?.token, setLinks]);

  
  const handleCreate = async () => {
    if (!newLink.trim() || !user?.token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ original: newLink }),
      });
      if (!res.ok) throw new Error("Create failed");

      const data: LinkType = await res.json();
      addOrUpdateLink(data); 
      setNewLink("");
    } catch (err: any) {
      setError(err.message || "Failed to create link");
    }
  };


  const handleDelete = async (_id: string) => {
    if (!user?.token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/links/${_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error("Delete failed");

      removeLink(_id);
    } catch (err: any) {
      setError(err.message || "Failed to delete link");
    }
  };

 
  const handleUpdate = async (_id: string) => {
    if (!editValue.trim() || !user?.token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/links/${_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ original: editValue }),
      });
      if (!res.ok) throw new Error("Update failed");

      addOrUpdateLink({ _id, original: editValue }); 
      setEditingId(null);
      setEditValue("");
    } catch (err: any) {
      setError(err.message || "Failed to update link");
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <div className="p-4 space-y-4">
          <h1 className="text-xl font-bold">Your Links</h1>

          {error && <p className="text-red-500">{error}</p>}
          {loading && <p className="text-gray-500">Loading...</p>}

          <div className="flex gap-2">
            <input
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="Enter original URL"
              className="border rounded p-2 flex-1"
            />
            <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded">
              Create
            </button>
          </div>

<div className="grid gap-4">
  {(links ?? []).map((link) => (
    <div key={link._id} className="border rounded p-4 shadow">
      {editingId === link._id ? (
        <div className="flex gap-2">
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="border rounded p-2 flex-1"
          />
          <button
            onClick={() => handleUpdate(link._id)}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Save
          </button>
          <button
            onClick={() => { setEditingId(null); setEditValue(""); }}
            className="bg-gray-400 text-white px-3 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <p>
            <strong>Short URL:</strong>{" "}
            <a
              href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${link.shortID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {`${process.env.NEXT_PUBLIC_BACKEND_URL}/${link.shortID}`}
            </a>
          </p>
          <p className="truncate"><strong>Original:</strong> {link.original}</p>
          <p><strong>Clicks:</strong> {link.clicks}</p>
          <p><strong>Created:</strong> {new Date(link.createdAt).toLocaleString()}</p>
          <p><strong>Updated:</strong> {link.updatedAt ? new Date(link.updatedAt).toLocaleString() : "-"}</p>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => { setEditingId(link._id); setEditValue(link.original); }}
              className="bg-yellow-500 text-white px-3 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(link._id)}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
            <button
              onClick={() => router.push(`/analytics/${link._id}`)}
              className="bg-purple-600 text-white px-3 py-1 rounded"
            >
              Analytics
            </button>
          </div>
        </>
      )}
    </div>
  ))}
</div>

        </div>
      </div>
    </div>
  );
}
