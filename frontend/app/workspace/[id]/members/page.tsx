"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { WorkspaceInvite } from "@/lib/types";
type Member = {
  _id: string;
  userId: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
};

export default function MembersPage() {
  const { id: workspaceId } = useParams();
  const { user, invites, setInvites, addOrUpdateInvite } = useAppStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!workspaceId || !user?.token) return;

      setLoading(true);
      try {
        const [memberRes, inviteRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${workspaceId}/members`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${workspaceId}/invites`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);

        const memberData = await memberRes.json();
        const inviteData = await inviteRes.json();

        
        // setMembers(
        //   (memberData.members || []).map((m: any) => ({
        //     ...m,
        //     _id: typeof m._id === "object" && m._id.Data ? m._id.Data : m._id,
        //     userId: typeof m.userId === "object" && m.userId.Data ? m.userId.Data : m.userId,
        //   }))
        // );
        const normalizeMember = (m: any): Member => ({
  _id: typeof m._id === "object" && m._id.Data ? m._id.Data : m._id,
  userId: typeof m.userId === "object" && m.userId.Data ? m.userId.Data : m.userId,
  name: m.name,
  email: m.email,
  role: m.role,
});

setMembers((memberData.members || []).map(normalizeMember));

        setInvites(inviteData.invites || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [workspaceId, user, setInvites]);

  const updateRole = async (userId: string, role: "member" | "admin") => {
    if (!workspaceId || !user?.token) return;
    const encodedUserId = encodeURIComponent(userId); 
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${workspaceId}/members/${encodedUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");

      setMembers(prev =>
        prev.map(m => (m.userId === userId ? { ...m, role } : m))
      );
      
    } catch (err) {
      console.error(err);
    }
  };

  const removeMember = async (userId: string) => {
    if (!workspaceId || !user?.token) return;
    const encodedUserId = encodeURIComponent(userId); 
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${workspaceId}/members/${encodedUserId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (res.ok) setMembers(prev => prev.filter(m => m.userId !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const sendInvite = async (email: string) => {
    if (!workspaceId || !user?.token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/${workspaceId}/members`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send invite");
      }

      const data = await res.json();
      const newInvite: WorkspaceInvite = {
        _id: data._id,
        workspaceID: data.workspaceID,
        email: data.email,
        role: data.role,
        token: data.token,
        status: data.status,
        invitedBy: data.invitedBy,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
      };
      addOrUpdateInvite(newInvite);
      setInviteEmail("");
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  const resendInvite = async (inviteId: string) => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/invite/${inviteId}/resend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) alert("Invite resent!");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-6">Loading members...</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Workspace Members</h1>

      <div>
        <h2 className="text-lg font-semibold">Invite Member</h2>
        <div className="flex space-x-2 mt-2">
          <input
            className="border px-2 py-1 rounded flex-1"
            placeholder="email@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-1 rounded"
            onClick={() => sendInvite(inviteEmail)}
          >
            Invite
          </button>
        </div>
      </div>

      {invites.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mt-6">Pending Invites</h2>
          <ul className="space-y-2">
            {invites.map((i, idx) => (
              <li
                key={`${i._id || i.email || "invite"}-${idx}`}
                className="flex items-center justify-between border p-2 rounded"
              >
                <span>
                  {i.email} — <em>{i.status}</em>
                </span>
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => resendInvite(i._id)}
                >
                  Resend
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mt-6">Members</h2>
        <ul className="space-y-2">
          {members.map((m, idx) => (
            <li
              key={`${m._id || m.email || "members"}-${idx}`}
              className="flex items-center justify-between border p-2 rounded"
            >
              <span>
                {m.name || m.email} — <em>{m.role}</em>
              </span>
              <div className="space-x-2">
                {m.role !== "owner" && (
                  <>
                    <button
                      className="text-sm bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() =>
                        updateRole(m.userId, m.role === "admin" ? "member" : "admin")
                      }
                    >
                      {m.role === "admin" ? "Demote" : "Promote"}
                    </button>
                    <button
                      className="text-sm bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => removeMember(m.userId)}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}



