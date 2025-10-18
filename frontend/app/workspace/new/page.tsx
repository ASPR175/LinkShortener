
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Workspace } from "@/lib/types";

export default function NewWorkspacePage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
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
      const workspaceData = data.workspace;
      const memberData = data.member;

      if (!workspaceData?._id) throw new Error("Workspace ID not returned");

      const workspaceObj: Workspace = {
        _id: workspaceData._id.toString(),
        name: workspaceData.name ?? "Unnamed",
        role: "owner",
        links: [],
        members: memberData
          ? [
              {
                _id: memberData._id.toString(),
                name: memberData.name ?? "Unnamed",
                email: memberData.email ?? "",
                avatarURL: memberData.avatarURL ?? "",
                role: "admin",
              },
            ]
          : [],
      };

      useAppStore.getState().addOrUpdateWorkspace(workspaceObj);
      useAppStore.getState().setCurrentWorkspace(workspaceObj._id);

      setToast("Workspace created! Redirecting...");
      setTimeout(() => router.push(`/workspace/${workspaceObj._id}`), 1500);
    } catch (err: any) {
      console.error(err);
      setToast(err.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white p-6">
      <div className="max-w-lg w-full bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-teal-400 animate-fade-in">
          Create a New Workspace
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Workspace Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing Team"
              className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 transition px-4 py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Workspace"}
          </button>
        </form>

        {toast && (
          <div className="mt-4 p-3 bg-teal-600 text-white rounded shadow-md animate-fade-in">
            {toast}
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease forwards;
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}


