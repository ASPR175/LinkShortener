"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {useAppStore} from "@/lib/store";

export default function JoinWorkspacePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const setUser = useAppStore((state) => state.setUser);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setError("No token provided");
      setLoading(false);
      return;
    }

    const joinWorkspace = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspace/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to join workspace");
        } else {
          
          if (data.user) setUser(data.user);
          setSuccess(true);

        
          setTimeout(() => router.push("/dashboard"), 2000);
        }
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    joinWorkspace();
  }, [token, setUser, router]);

  if (loading) return <p className="p-4">Joining workspace...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;
  if (success) return <p className="p-4 text-green-500">Joined workspace! Redirecting...</p>;

  return null;
}
