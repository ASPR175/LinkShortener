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
    if (!name.trim() || !token) return;

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

      const workspace = data.workspace;
      const member = data.member;

      if (!workspace?._id) throw new Error("Workspace ID not returned");

      const workspaceId = workspace._id.toString();

      // Normalize workspace
      useAppStore.getState().addWorkspace({
        _id: workspaceId,
        name: workspace.name ?? "Unnamed",
        links: [],
        role: "owner",
        members: member
          ? [
              {
                _id: member._id.toString(),
                name: member.name ?? "Unnamed",
                email: member.email ?? "",
                avatarURL: member.avatarURL ?? "",
                role: member.role ?? "owner",
              },
            ]
          : [],
      });

      useAppStore.getState().setCurrentWorkspace(workspaceId);

      router.push(`/workspace/${workspaceId}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to create workspace");
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

