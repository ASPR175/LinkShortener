"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useAppStore from "@/lib/store";

export default function Sidebar() {
  const workspaces = useAppStore((s) => s.workspaces);
  const currentWorkspaceId = useAppStore((s) => s.currentWorkspaceId);
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-100 border-r p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-4">Your Workspaces</h2>

      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {workspaces.length === 0 && (
          <p className="text-gray-500">No workspaces yet</p>
        )}

        {workspaces.map((ws) => {
          
          const wsId = ws._id?.toString?.() || ws._id || "";
          const isActive =
            wsId === currentWorkspaceId ||
            pathname.startsWith(`/workspace/${wsId}`);

          return (
            <Link
              key={wsId}
              href={`/workspace/${wsId}`}
              className={`block px-3 py-2 rounded ${
                isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200"
              }`}
            >
              {ws.name ?? "Unnamed"}
            </Link>
          );
        })}
      </div>



     <div className="mt-6">
        <h2 className="text-lg font-bold mb-2">Your Links</h2>
        <Link
          href="/links"
          className={`block px-3 py-2 rounded ${
            pathname.startsWith("/links")
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-200"
          }`}
        >
          🔗 Links
        </Link>
      </div>


      <Link
        href="/workspace/new"
        className="mt-4 block text-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        + New Workspace
      </Link>
    </aside>
  );
}




