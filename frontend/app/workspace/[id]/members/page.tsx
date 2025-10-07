"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";

type Member = {
  _id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
};

export default function MembersPage() {
  const { id: workspaceId } = useParams();
  const { user, workspaces, addOrUpdateWorkspace } = useAppStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invites, setInvites] = useState<{ id: string; email: string; status: string }[]>([]);

  const workspace = workspaces.find((w) => w._id === workspaceId);

  
  useEffect(() => {
    async function fetchMembers() {
      if (!workspaceId || !user?.token) return;

      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspace/${workspaceId}/members`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        setMembers(data.members || []);

    
        const invRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspace/${workspaceId}/invites`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const invData = await invRes.json();
        setInvites(invData.invites || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, [workspaceId, user]);

  const updateRole = async (memberId: string, role: "member" | "admin") => {
    if (!workspaceId || !user?.token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspace/${workspaceId}/members/${memberId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) => (m._id === memberId ? { ...m, role } : m))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!workspaceId || !user?.token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspace/${workspaceId}/members/${memberId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m._id !== memberId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendInvite = async (email: string) => {
    if (!workspaceId || !user?.token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspace/${workspaceId}/members`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        setInvites((prev) => [...prev, { id: data.inviteId, email, status: "pending" }]);
        setInviteEmail("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resendInvite = async (inviteId: string) => {
    if (!user?.token) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspace/invite/${inviteId}/resend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      alert("Invite resent!");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-6">Loading members...</div>;

  return (
    <div className="p-6 space-y-6">
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
          <button className="bg-blue-500 text-white px-4 py-1 rounded" onClick={() => sendInvite(inviteEmail)}>
            Invite
          </button>
        </div>
      </div>

      {invites.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mt-4">Pending Invites</h2>
          <ul className="space-y-2">
            {invites.map((i) => (
              <li key={i.id} className="flex items-center justify-between">
                <span>{i.email} ({i.status})</span>
                <button
                  className="text-sm text-blue-600"
                  onClick={() => resendInvite(i.id)}
                >
                  Resend
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mt-4">Members</h2>
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m._id} className="flex items-center justify-between border p-2 rounded">
              <span>{m.name || m.email} — <em>{m.role}</em></span>
              <div className="space-x-2">
                {m.role !== "owner" && (
                  <>
                    <button
                      className="text-sm bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => updateRole(m._id, m.role === "admin" ? "member" : "admin")}
                    >
                      {m.role === "admin" ? "Demote" : "Promote"}
                    </button>
                    <button
                      className="text-sm bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => removeMember(m._id)}
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

