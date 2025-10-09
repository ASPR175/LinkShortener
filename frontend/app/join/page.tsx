"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function JoinWorkspacePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { user } = useAppStore();
  const setUser = useAppStore((state) => state.setUser);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setError("No token provided");
      setLoading(false);
      return;
    }

    // Prompt login if user is not logged in
    if (!user) {
      setError("You need to be logged in to accept this invite.");
      setLoading(false);
      return;
    }

    const joinWorkspace = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/workspace/join/${token}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to join workspace");
        } else {
          if (data.user) setUser(data.user);
          setSuccess(true);

          // Redirect after short delay
          setTimeout(() => router.push("/dashboard"), 2000);
        }
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    joinWorkspace();
  }, [token, user, setUser, router]);

  if (loading) return <p className="p-4">Joining workspace...</p>;
  if (error)
    return (
      <p className="p-4 text-red-500">
        {error} <br />
        { !user && <button onClick={() => router.push("/login")} className="text-blue-600 underline mt-2 block">Login to continue</button>}
      </p>
    );
  if (success)
    return <p className="p-4 text-green-500">Joined workspace! Redirecting...</p>;

  return null;
}

