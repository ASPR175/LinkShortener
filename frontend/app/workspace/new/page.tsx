"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAppStore from "@/lib/store";
export default function NewWorkspacePage() {
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const router = useRouter();
const token = useAppStore.getState().user?.token;
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) throw new Error("Failed to create workspace");

    const data = await res.json();
   

    const workspaceId = data.workspace?.ID || data.workspace?._id;
    if (!workspaceId) throw new Error("Workspace ID not returned");

    useAppStore.getState().addWorkspace({
  _id: workspaceId,
  name: data.workspace.Name || data.workspace.name,
  links: [],
   role: "owner",     
  members: [data.member],
});



useAppStore.getState().setCurrentWorkspace(workspaceId);
    router.push(`/workspace/${workspaceId}`);
  } catch (err) {
    console.error(err);
    alert("Failed to create workspace");
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create a New Workspace</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Workspace Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Marketing Team"
            className="border rounded px-3 py-2 w-full"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Workspace"}
        </button>
      </form>
    </div>
  );
}
