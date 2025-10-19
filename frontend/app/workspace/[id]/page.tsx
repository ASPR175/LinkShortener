"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { useAppStore } from "@/lib/store";
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
  const [toast, setToast] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmEditId, setConfirmEditId] = useState<string | null>(null);
const [workspace, setWorkspace] = useState<any>(null);
  const workspaceId: string | null =
    Array.isArray(params.id) ? params.id[0] : params.id ?? null;

  // const workspace = workspaceId
  //   ? workspaces.find((w) => w._id === workspaceId) ?? null
  //   : null;
console.log("workspace state", workspace);
console.log("links", workspace?.links);

 
// useEffect(() => {
//   if (!workspaceId || !token) return;

//   setLoading(true);
//   (async () => {
//     try {
//       const { fetchWorkspaceDetail, setCurrentWorkspace } = useAppStore.getState();
//       await fetchWorkspaceDetail(workspaceId, token);
//       setCurrentWorkspace(workspaceId);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   })();
// }, [workspaceId, token]);
useEffect(() => {
  if (!workspaceId || !token) return;

  setLoading(true);
  (async () => {
    try {
      const { fetchWorkspaceDetail, setCurrentWorkspace } = useAppStore.getState();
      const ws = await fetchWorkspaceDetail(workspaceId, token);
      setWorkspace(ws); // isolate data locally
      setCurrentWorkspace(workspaceId);
    } catch (err) {
      console.error("Workspace fetch failed:", err);
    } finally {
      setLoading(false);
    }
  })();
}, [workspaceId, token]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

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
      showToast("Link created!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create link");
    } finally {
      setLinkLoading(false);
    }
  };

  const handleDelete = async (_id: string) => {
    if (!token || !workspace) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${workspace._id}/links/${_id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
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

      setConfirmDeleteId(null);
      showToast("Link deleted!");
    } catch (err: any) {
      console.error(err);
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
      setConfirmEditId(null);
      showToast("Link updated!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update link");
    }
  };
if (loading) return <div className="p-6">Loading workspace...</div>;
if (!workspace) return <div className="p-6">Workspace not found</div>;



  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <Navbar />
        <div className="p-6 space-y-6">
          
          {toast && (
            <div className="fixed top-6 right-6 bg-teal-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
              {toast}
            </div>
          )}

         
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-100 via-blue-50 to-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
  <h1 className="text-3xl font-extrabold text-gray-800 tracking-wide">
    {workspace.name}
  </h1>
  <Link
    href={`/workspace/${workspace._id}/members`}
    className="text-blue-600 font-semibold hover:text-blue-800 underline transition-colors duration-200"
  >
    View Members →
  </Link>
</div>


          
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
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {linkLoading ? "Creating..." : "Create"}
            </button>
          </div>

          {workspace.links.length === 0 && (
            <p className="text-gray-500">No links yet</p>
          )}

         
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspace.links.map((link, idx) => {
              const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;
              return (
                <div
                  key={link._id || `link-${idx}`}
                  className="p-4 rounded-2xl shadow-lg border border-gray-200 relative transition-all transform hover:scale-[1.03] animate-fade-in"
                  style={{ background: `linear-gradient(135deg, ${color}50, white)` }}
                >
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
                          setConfirmEditId(null);
                        }}
                        className="bg-gray-400 text-white px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="truncate">
                        <strong>Original:</strong> {link.original}
                      </p>
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
                      <p>
                        <strong>Clicks:</strong> {link.clicks}
                      </p>
                      <p>
                        <strong>Created:</strong>{" "}
                        {new Date(link.createdAt).toLocaleString()}
                      </p>
                      <p>
                        <strong>Updated:</strong>{" "}
                        {link.updatedAt
                          ? new Date(link.updatedAt).toLocaleString()
                          : "-"}
                      </p>

                      
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setConfirmEditId(link._id)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(link._id)}
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

                      
                      {confirmEditId === link._id && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full space-y-4">
                            <p>Are you sure you want to edit this link?</p>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingId(link._id);
                                  setEditValue(link.original);
                                  setConfirmEditId(null);
                                }}
                                className="bg-green-600 text-white px-3 py-1 rounded"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setConfirmEditId(null)}
                                className="bg-gray-400 text-white px-3 py-1 rounded"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                   
                      {confirmDeleteId === link._id && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full space-y-4">
                            <p>Are you sure you want to delete this link?</p>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleDelete(link._id)}
                                className="bg-red-600 text-white px-3 py-1 rounded"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="bg-gray-400 text-white px-3 py-1 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


// "use client";

// import { useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Sidebar from "@/components/sidebar";
// import Navbar from "@/components/navbar";
// import { useAppStore } from "@/lib/store";
// import Link from "next/link";
// import { normalizeLink } from "@/lib/linkSlice";

// export default function WorkspacePage() {
//   const params = useParams();
//   const router = useRouter();
//   const token = useAppStore((s) => s.user?.token);
//   const fetchWorkspaceDetail = useAppStore((s) => s.fetchWorkspaceDetail);
//   const setCurrentWorkspace = useAppStore((s) => s.setCurrentWorkspace);

//   const workspaceId: string | null =
//     Array.isArray(params.id) ? params.id[0] : params.id ?? null;

//   // Reactive workspace from store
//   const workspace = useAppStore((s) =>
//     workspaceId ? s.workspaces.find((w) => w._id === workspaceId) ?? null : null
//   );

//   // Loading & UI states
//   const [loading, setLoading] = useState(!workspace); // load if workspace not in store yet
//   const [newLink, setNewLink] = useState("");
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editValue, setEditValue] = useState("");
//   const [linkLoading, setLinkLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [toast, setToast] = useState("");
//   const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
//   const [confirmEditId, setConfirmEditId] = useState<string | null>(null);

//   // Fetch workspace if missing
//   if (!loading && workspaceId && !workspace && token) {
//     setLoading(true);
//     fetchWorkspaceDetail(workspaceId, token)
//       .then((data) => setCurrentWorkspace(workspaceId))
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }

//   const showToast = (msg: string) => {
//     setToast(msg);
//     setTimeout(() => setToast(""), 2000);
//   };

//   const handleCreate = async () => {
//     if (!newLink.trim() || !token || !workspace) return;
//     try {
//       setLinkLoading(true);
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${workspace._id}/links`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ original: newLink }),
//         }
//       );
//       if (!res.ok) throw new Error("Failed to create link");

//       const data = await res.json();
//       const newLinkObj = normalizeLink(data);

//       useAppStore.setState((state) => ({
//         workspaces: state.workspaces.map((w) =>
//           w._id === workspace._id
//             ? { ...w, links: [...(w.links || []), newLinkObj] }
//             : w
//         ),
//       }));

//       setNewLink("");
//       showToast("Link created!");
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message || "Failed to create link");
//     } finally {
//       setLinkLoading(false);
//     }
//   };

//   const handleDelete = async (_id: string) => {
//     if (!token || !workspace) return;
//     try {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${workspace._id}/links/${_id}`,
//         { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
//       );
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Delete failed");

//       useAppStore.setState((state) => ({
//         workspaces: state.workspaces.map((w) =>
//           w._id === workspace._id
//             ? { ...w, links: (w.links || []).filter((l) => l._id !== _id) }
//             : w
//         ),
//       }));

//       setConfirmDeleteId(null);
//       showToast("Link deleted!");
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message || "Failed to delete link");
//     }
//   };

//   const handleUpdate = async (_id: string) => {
//     if (!editValue.trim() || !token || !workspace) return;

//     try {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${workspace._id}/links/${_id}`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ original: editValue }),
//         }
//       );
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Update failed");

//       useAppStore.setState((state) => ({
//         workspaces: state.workspaces.map((w) =>
//           w._id === workspace._id
//             ? {
//                 ...w,
//                 links: (w.links || []).map((l) =>
//                   l._id === _id ? { ...l, original: editValue } : l
//                 ),
//               }
//             : w
//         ),
//       }));

//       setEditingId(null);
//       setEditValue("");
//       setConfirmEditId(null);
//       showToast("Link updated!");
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message || "Failed to update link");
//     }
//   };

//   if (loading) return <div className="p-6">Loading workspace...</div>;
//   if (!workspace) return <div className="p-6">Workspace not found</div>;

//   return (
//     <div className="flex h-screen bg-gray-50">
//       <Sidebar />
//       <div className="flex-1 flex flex-col overflow-auto">
//         <Navbar />
//         <div className="p-6 space-y-6">
//           {toast && (
//             <div className="fixed top-6 right-6 bg-teal-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
//               {toast}
//             </div>
//           )}

//           <div className="flex items-center justify-between bg-gradient-to-r from-blue-100 via-blue-50 to-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
//             <h1 className="text-3xl font-extrabold text-gray-800 tracking-wide">
//               {workspace.name}
//             </h1>
//             <Link
//               href={`/workspace/${workspace._id}/members`}
//               className="text-blue-600 font-semibold hover:text-blue-800 underline transition-colors duration-200"
//             >
//               View Members →
//             </Link>
//           </div>

//           <div className="flex gap-2 mb-4">
//             <input
//               value={newLink}
//               onChange={(e) => setNewLink(e.target.value)}
//               placeholder="Enter original URL"
//               className="border rounded p-2 flex-1"
//             />
//             <button
//               onClick={handleCreate}
//               disabled={linkLoading}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
//             >
//               {linkLoading ? "Creating..." : "Create"}
//             </button>
//           </div>

//           {(workspace.links || []).length === 0 && (
//             <p className="text-gray-500">No links yet</p>
//           )}

//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {(workspace.links || []).map((link, idx) => {
//               const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;
//               return (
//                 <div
//                   key={link._id || `link-${idx}`}
//                   className="p-4 rounded-2xl shadow-lg border border-gray-200 relative transition-all transform hover:scale-[1.03] animate-fade-in"
//                   style={{ background: `linear-gradient(135deg, ${color}50, white)` }}
//                 >
//                   {editingId === link._id ? (
//                     <div className="flex gap-2">
//                       <input
//                         value={editValue}
//                         onChange={(e) => setEditValue(e.target.value)}
//                         className="border rounded p-2 flex-1"
//                       />
//                       <button
//                         onClick={() => handleUpdate(link._id)}
//                         className="bg-green-600 text-white px-3 py-1 rounded"
//                       >
//                         Save
//                       </button>
//                       <button
//                         onClick={() => {
//                           setEditingId(null);
//                           setEditValue("");
//                           setConfirmEditId(null);
//                         }}
//                         className="bg-gray-400 text-white px-3 py-1 rounded"
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   ) : (
//                     <>
//                       <p className="truncate">
//                         <strong>Original:</strong> {link.original}
//                       </p>
//                       <p>
//                         <strong>Short URL:</strong>{" "}
//                         <a
//                           href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${link.shortID}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-blue-600 underline"
//                         >
//                           {`${process.env.NEXT_PUBLIC_BACKEND_URL}/${link.shortID}`}
//                         </a>
//                       </p>
//                       <p>
//                         <strong>Clicks:</strong> {link.clicks}
//                       </p>
//                       <p>
//                         <strong>Created:</strong>{" "}
//                         {new Date(link.createdAt).toLocaleString()}
//                       </p>
//                       <p>
//                         <strong>Updated:</strong>{" "}
//                         {link.updatedAt
//                           ? new Date(link.updatedAt).toLocaleString()
//                           : "-"}
//                       </p>
//                     </>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




