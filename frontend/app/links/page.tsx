"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import useAppStore from "@/lib/store";

interface Link {
  _id: string;
  short_id: string;
  original: string;
  clicks: number;
  created_at: string;
  updated_at?: string;
  workspace_id?: string | null;
}

export default function LinksPage() {


  const { user, links, setLinks, addLink, removeLink, updateLink } = useAppStore();
  const [hydrated, setHydrated] = useState(false);

  const [newLink, setNewLink] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
console.log("User in store:", user);
console.log("Token being sent:", user?.token);

  
  useEffect(() => {
    setHydrated(true);
  }, []);

  
  useEffect(() => {
    if (!hydrated || !user || !user.token) return;
  
    const fetchLinks = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/links`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data: Link[] = await res.json();

        
        setLinks(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch links");
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [hydrated, user, setLinks]);

  const handleCreate = async () => {
    if (!newLink.trim() || !user) return;
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
      const data: Link = await res.json();
      addLink(data);
      setNewLink("");
    } catch (err: any) {
      setError(err.message || "Failed to create link");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/links/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      removeLink(id);
    } catch (err: any) {
      setError(err.message || "Failed to delete link");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editValue.trim() || !user) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/links/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ original: editValue }),
      });
      if (!res.ok) throw new Error("Update failed");
      const data: Link = await res.json();
      updateLink(id, data);
      setEditingId(null);
      setEditValue("");
    } catch (err: any) {
      setError(err.message || "Failed to update link");
    }
  };

  if (!hydrated) return <div>Loading...</div>; 

  const safeLinks = Array.isArray(links) ? links : [];

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
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Create
            </button>
          </div>

          <div className="grid gap-4">
            {safeLinks.map((link: Link) => (
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
                      onClick={() => {
                        setEditingId(null);
                        setEditValue("");
                      }}
                      className="bg-gray-400 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <p><strong>Short ID:</strong> {link.short_id}</p>
                    <p className="truncate"><strong>Original:</strong> {link.original}</p>
                    <p><strong>Clicks:</strong> {link.clicks}</p>
                    <p><strong>Created:</strong> {new Date(link.created_at).toLocaleString()}</p>
                    <p><strong>Updated:</strong> {link.updated_at ? new Date(link.updated_at).toLocaleString() : "-"}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          setEditingId(link._id);
                          setEditValue(link.original);
                        }}
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


