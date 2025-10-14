"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { useAppStore } from "@/lib/store";
import { Link as LinkType } from "@/lib/types";
import { normalizeLink } from "@/lib/linkSlice";
import { Copy, Loader2, Trash2, Edit3, Eye } from "lucide-react";

type ToastType = "info" | "success" | "error";

export default function LinksPage() {
  const router = useRouter();
  const { user, links, setLinks, removeLink, addOrUpdateLink } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newLink, setNewLink] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [sortKey, setSortKey] = useState<"createdAt" | "clicks">("createdAt");
  const [toasts, setToasts] = useState<{id:number,message:string,type:ToastType}[]>([]);

  const addToast = (message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  };

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
        setLinks(Array.isArray(data) ? data : []);
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
      addOrUpdateLink(normalizeLink(data));
      setNewLink("");
      addToast("Link created!", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to create link", "error");
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
      addToast("Link deleted!", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to delete link", "error");
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
      addToast("Link updated!", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to update link", "error");
    }
  };

  const handleCopy = (shortID: string) => {
    navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${shortID}`);
    addToast("Copied to clipboard!", "info");
  };

  const sortedLinks = [...(links ?? [])].sort((a, b) => {
    if (sortKey === "clicks") return b.clicks - a.clicks;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Toasts */}
          <div className="fixed top-6 right-6 flex flex-col gap-2 z-50">
            {toasts.map(t => (
              <div
                key={t.id}
                className={`px-4 py-2 rounded shadow-lg text-white font-medium animate-fade-in
                  ${t.type==="success"?"bg-teal-600":t.type==="error"?"bg-red-600":"bg-blue-600"}`}
              >
                {t.message}
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Your Links</h1>
            <div className="flex gap-2">
              <input
                value={newLink}
                onChange={e => setNewLink(e.target.value)}
                placeholder="Enter original URL"
                className="border rounded p-2 flex-1"
              />
              <button onClick={handleCreate} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded transition">
                Create
              </button>
            </div>
          </div>

          {/* Sorting */}
          <div className="flex gap-2">
            <button className={`px-3 py-1 rounded border ${sortKey==="createdAt"?"bg-teal-600 text-white":"bg-white"}`} onClick={()=>setSortKey("createdAt")}>Sort by Created</button>
            <button className={`px-3 py-1 rounded border ${sortKey==="clicks"?"bg-teal-600 text-white":"bg-white"}`} onClick={()=>setSortKey("clicks")}>Sort by Clicks</button>
          </div>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedLinks.map(link=>{
              const color = `hsl(${Math.floor(Math.random()*360)}, 70%, 60%)`;
              return (
                <div key={link._id} className="p-4 rounded-2xl shadow-md border border-gray-200 relative transition-transform transform hover:scale-[1.03] animate-fade-in"
                  style={{ background: `linear-gradient(135deg, ${color}30, white)` }}>
                  {editingId===link._id?(
                    <div className="flex gap-2">
                      <input value={editValue} onChange={e=>setEditValue(e.target.value)} className="border rounded p-2 flex-1"/>
                      <button onClick={()=>handleUpdate(link._id)} className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
                      <button onClick={()=>{setEditingId(null); setEditValue("")}} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</button>
                    </div>
                  ):(
                    <>
                      <p className="truncate"><strong>Original:</strong> {link.original}</p>
                      <p className="flex items-center gap-1">
                        <strong>Short URL:</strong>{" "}
                        <span className="text-teal-700 underline cursor-pointer hover:text-teal-900 transition" onClick={()=>handleCopy(link.shortID)}>
                          {`${process.env.NEXT_PUBLIC_BACKEND_URL}/${link.shortID}`} <Copy className="inline-block h-4 w-4"/>
                        </span>
                      </p>
                      <p><strong>Clicks:</strong> {link.clicks}</p>
                      <p><strong>Created:</strong> {new Date(link.createdAt).toLocaleString()}</p>
                      <p><strong>Updated:</strong> {link.updatedAt?new Date(link.updatedAt).toLocaleString():"-"}</p>
                      <div className="flex gap-2 mt-2">
                        <button onClick={()=>{setEditingId(link._id);setEditValue(link.original)}} className="bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-1"><Edit3 className="h-4 w-4"/> Edit</button>
                        <button onClick={()=>handleDelete(link._id)} className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"><Trash2 className="h-4 w-4"/> Delete</button>
                        <button onClick={()=>router.push(`/analytics/${link._id}`)} className="bg-purple-600 text-white px-3 py-1 rounded flex items-center gap-1"><Eye className="h-4 w-4"/> Analytics</button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-in-out; }
        @keyframes fadeIn { 0% { opacity:0; transform: translateY(10px);} 100% { opacity:1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}



