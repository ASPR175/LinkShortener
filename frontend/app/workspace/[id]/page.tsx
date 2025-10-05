"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import useAppStore from "@/lib/store";
import Link from "next/link";
import { normalizeLink } from "@/lib/linkSlice";

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();

  const token = useAppStore((s) => s.user?.token);
  const workspaces = useAppStore((s) => s.workspaces);
  const setCurrentWorkspace = useAppStore((s) => s.setCurrentWorkspace);
  const fetchWorkspaceDetail = useAppStore((s) => s.fetchWorkspaceDetail);

  const [loading, setLoading] = useState(true);
  const [newLink, setNewLink] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [error, setError] = useState("");

 
  const workspaceId: string | null =
    Array.isArray(params.id) ? params.id[0] : params.id ?? null;

  const workspace = workspaceId
    ? workspaces.find((w) => w._id === workspaceId) ?? null
    : null;

 
  useEffect(() => {
    if (!workspaceId || !token) return;

    setLoading(true);
    fetchWorkspaceDetail(workspaceId, token)
      .then(() => setCurrentWorkspace(workspaceId))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [workspaceId, token, fetchWorkspaceDetail, setCurrentWorkspace]);

  
  const handleCreate = async () => {
    if (!newLink.trim() || !token || !workspace) return;

    try {
      setLinkLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${workspace._id}/links`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ original: newLink }),
        }
      );

      if (!res.ok) throw new Error("Failed to create link");

      const data = await res.json();
      const newLinkObj = normalizeLink(data);

      useAppStore.setState((state) => ({
        workspaces: state.workspaces.map((w) =>
          w._id === workspace._id
            ? { ...w, links: [...w.links, newLinkObj] }
            : w
        ),
      }));

      setNewLink("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create link");
    } finally {
      setLinkLoading(false);
    }
  };

  // const handleDelete = async (_id: string) => {
  //   if (!token || !workspace) return;

  //   try {
  //     const res = await fetch(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${workspace._id}/links/${_id}`,
  //       { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     if (!res.ok) throw new Error("Delete failed");

  //     useAppStore.setState((state) => ({
  //       workspaces: state.workspaces.map((w) =>
  //         w._id === workspace._id
  //           ? { ...w, links: w.links.filter((l) => l._id !== _id) }
  //           : w
  //       ),
  //     }));
  //   } catch (err: any) {
  //     console.error(err);
  //     setError(err.message || "Failed to delete link");
  //   }
  // };

  // const handleUpdate = async (_id: string) => {
  //   if (!editValue.trim() || !token || !workspace) return;

  //   try {
  //     const res = await fetch(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${workspace._id}/links/${_id}`,
  //       {
  //         method: "PATCH",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({ original: editValue }),
  //       }
  //     );
  //     if (!res.ok) throw new Error("Update failed");

  //     useAppStore.setState((state) => ({
  //       workspaces: state.workspaces.map((w) =>
  //         w._id === workspace._id
  //           ? {
  //               ...w,
  //               links: w.links.map((l) =>
  //                 l._id === _id ? { ...l, original: editValue } : l
  //               ),
  //             }
  //           : w
  //       ),
  //     }));

  //     setEditingId(null);
  //     setEditValue("");
  //   } catch (err: any) {
  //     console.error(err);
  //     setError(err.message || "Failed to update link");
  //   }
  // };
const handleDelete = async (_id: string) => {
  if (!token || !workspace) return;
console.log("workspaceID from the hell:",workspace._id)
console.log("ID from the hell:",_id)
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${workspace._id}/links/${_id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Delete failed");

   
    useAppStore.setState((state) => ({
      workspaces: state.workspaces.map((w) =>
        w._id === workspace._id
          ? { ...w, links: w.links.filter((l) => l._id !== _id) }
          : w
      ),
    }));
  } catch (err: any) {
    console.error("DeleteLink error:", err);
    setError(err.message || "Failed to delete link");
  }
};

const handleUpdate = async (_id: string) => {
  if (!editValue.trim() || !token || !workspace) return;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${workspace._id}/links/${_id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ original: editValue }),
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Update failed");

   
    useAppStore.setState((state) => ({
      workspaces: state.workspaces.map((w) =>
        w._id === workspace._id
          ? {
              ...w,
              links: w.links.map((l) =>
                l._id === _id ? { ...l, original: editValue } : l
              ),
            }
          : w
      ),
    }));

    setEditingId(null);
    setEditValue("");
  } catch (err: any) {
    console.error("UpdateLink error:", err);
    setError(err.message || "Failed to update link");
  }
};

  if (loading) return <div className="p-6">Loading workspace...</div>;
  if (!workspace) return <div className="p-6">Workspace not found</div>;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <Navbar />
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{workspace.name}</h1>
            <Link
              href={`/workspace/${workspace._id}/members`}
              className="text-blue-600 underline"
            >
              View Members →
            </Link>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <div className="flex gap-2 mb-4">
            <input
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="Enter original URL"
              className="border rounded p-2 flex-1"
            />
            <button
              onClick={handleCreate}
              disabled={linkLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {linkLoading ? "Creating..." : "Create"}
            </button>
          </div>

          {workspace.links.length === 0 && (
            <p className="text-gray-500">No links yet</p>
          )}

          <div className="grid gap-4">
            {workspace.links.map((link, idx) => (
              <div key={link._id || `link-${idx}`} className="border rounded p-4 shadow">
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
                    <p>
                      <strong>Short URL:</strong>{" "}
                      <a
                        href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${link.short_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {`${process.env.NEXT_PUBLIC_BACKEND_URL}/${link.short_id}`}
                      </a>
                    </p>
                    <p className="truncate">
                      <strong>Original:</strong> {link.original}
                    </p>
                    <p>
                      <strong>Clicks:</strong> {link.clicks}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Date(link.created_at).toLocaleString()}
                    </p>
                    <p>
                      <strong>Updated:</strong>{" "}
                      {link.updated_at
                        ? new Date(link.updated_at).toLocaleString()
                        : "-"}
                    </p>
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




