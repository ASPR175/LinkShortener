// app/workspace/[id]/members/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Member = {
  userId: string;
  name: string;
  email: string;
  role: string;
};

export default function MembersPage() {
  const { id } = useParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/workspace/${id}/members`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json();
        setMembers(data.members || []);
      } catch (err) {
        console.error("Failed to fetch members", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchMembers();
  }, [id]);

  if (loading) return <div className="p-6">Loading members...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Members</h1>
      <ul className="space-y-2">
        {members.map((m) => (
          <li key={m.userId} className="text-sm">
            <span className="font-medium">{m.name || m.email}</span> —{" "}
            <span className="italic">{m.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
