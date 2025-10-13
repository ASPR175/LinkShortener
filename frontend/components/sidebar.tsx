"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const workspaces = useAppStore((s) => s.workspaces);
  const currentWorkspaceId = useAppStore((s) => s.currentWorkspaceId);
  const pathname = usePathname();
  const [loaded, setLoaded] = useState(false);

  const getWsId = (ws: typeof workspaces[number]) => String(ws._id);

  
  useEffect(() => {
    const { user, workspaces, fetchWorkspaces } = useAppStore.getState();
    if (user && workspaces.length === 0) fetchWorkspaces(user.token);
  }, []);

  
  useEffect(() => {
    if (workspaces.length > 0) setLoaded(true);
  }, [workspaces]);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 p-4">
      <h2 className="text-lg font-bold mb-4 text-teal-600">Your Workspaces</h2>

      <div className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-300 scrollbar-track-gray-100">
        {!loaded && (
          <div className="flex flex-col gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}

        {loaded &&
          (workspaces.length === 0 ? (
            <p className="text-gray-400 text-center mt-4">No workspaces yet</p>
          ) : (
            workspaces.map((ws) => {
              const wsId = getWsId(ws);
              const isActive =
                wsId === currentWorkspaceId ||
                pathname.startsWith(`/workspace/${wsId}`);

              return (
                <Link
                  key={wsId}
                  href={`/workspace/${wsId}`}
                  className={`block px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-teal-500 text-white shadow-md"
                      : "hover:bg-teal-100 hover:text-teal-700"
                  }`}
                >
                  {ws.name || "Unnamed"}
                </Link>
              );
            })
          ))}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-bold mb-2 text-teal-600">Your Links</h2>
        <Link
          href="/links"
          className={`block px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
            pathname.startsWith("/links")
              ? "bg-teal-500 text-white shadow-md"
              : "hover:bg-teal-100 hover:text-teal-700"
          }`}
        >
          🔗 Links
        </Link>
      </div>

      <Link
        href="/workspace/new"
        className="mt-6 block text-center bg-green-500 text-white px-4 py-2 rounded-xl font-semibold shadow hover:bg-green-600 transition-all duration-200"
      >
        + New Workspace
      </Link>
    </aside>
  );
}





