// "use client";

// import Sidebar from "@/components/sidebar";
// import Navbar from "@/components/navbar";
// import useAppStore from "@/lib/store";

// export default function DashboardPage() {
//   const user = useAppStore((s) => s.user);

//   if (!user) return <div>Please login first</div>;

 

//   return (
//     <div className="flex h-screen">
//       <Sidebar />
//       <div className="flex flex-col flex-1">
//         <Navbar />
//         <h1 className="text-2xl font-bold">Dashboard</h1>
//         <div className="flex items-center gap-3">
//           <span>{user.Email}</span>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import {useAppStore} from "@/lib/store";

export default function DashboardPage() {
  const user = useAppStore((s) => s.user);
  const token = user?.token ?? null;
  const fetchWorkspaces = useAppStore((s) => s.fetchWorkspaces);
  const setCurrentWorkspace = useAppStore((s) => s.setCurrentWorkspace);
  const workspaces = useAppStore((s) => s.workspaces);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    fetchWorkspaces(token)
      .then(() => {
      
        const current = useAppStore.getState().currentWorkspaceId;
        if (!current && workspaces.length > 0) {
          setCurrentWorkspace(workspaces[0]._id);
        }
      })
      .finally(() => setLoading(false));
  }, [token, fetchWorkspaces, setCurrentWorkspace]);

  if (!user) return <div>Please login first</div>;
  if (loading) return <div>Loading your workspaces...</div>;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <span>{user.email}</span>
        </div>
      </div>
    </div>
  );
}
