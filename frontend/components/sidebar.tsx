import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAppStore from "@/lib/store";

export default function Sidebar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const workspaces = useAppStore((s) => s.workspaces);
  const currentWorkspaceId = useAppStore((s) => s.currentWorkspaceId);
  const setCurrentWorkspace = useAppStore((s) => s.setCurrentWorkspace);
  const fetchWorkspaces = useAppStore((s) => s.fetchWorkspaces);
  const user = useAppStore((s) => s.user); 

  useEffect(() => {
    if (!user?.token) return; 
    fetchWorkspaces(user.token);
  }, [fetchWorkspaces, user?.token]);

  const currentWorkspace = workspaces.find((w) => w._id === currentWorkspaceId);

  return (
    <div className="w-56 border-r h-screen p-4 flex flex-col space-y-6">
      
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full text-left px-3 py-2 border rounded bg-gray-50 hover:bg-gray-100"
        >
          {currentWorkspace ? currentWorkspace.name : "Select Workspace"}
        </button>

        {open && (
          <div className="absolute mt-2 w-full bg-white border rounded shadow-md z-50">
            {workspaces.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No workspaces yet</div>
            ) : (
              workspaces.map((ws) => (
                <button
                  key={ws._id}
                  onClick={() => {
                    setCurrentWorkspace(ws._id);
                    setOpen(false);
                    router.push(`/workspace/${ws._id}`);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                    ws._id === currentWorkspaceId ? "bg-gray-200" : ""
                  }`}
                >
                  {ws.name}
                </button>
              ))
            )}

            <div className="border-t my-1" />

            <button
              onClick={() => {
                setOpen(false);
                router.push("/workspace/new");
              }}
              className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
            >
              + New Workspace
            </button>
          </div>
        )}
      </div>

      <Link href="/dashboard" className="px-2 py-1 hover:underline">
        Dashboard
      </Link>
      <Link href="/links" className="px-2 py-1 hover:underline">
        Links
      </Link>
    </div>
  );
}



