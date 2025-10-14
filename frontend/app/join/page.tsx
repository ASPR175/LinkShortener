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
      setError("No token provided.");
      setLoading(false);
      return;
    }

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
          setError(data.error || "Failed to join workspace.");
        } else {
          if (data.user) setUser(data.user);
          setSuccess(true);

          setTimeout(() => router.push("/dashboard"), 2000);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    joinWorkspace();
  }, [token, user, setUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white">
      <div className="text-center p-6 max-w-md mx-auto">
        {loading && (
          <div>
            <h1 className="text-2xl font-semibold mb-2">Joining Workspace...</h1>
            <p className="text-gray-400">Please wait while we prepare your space ✨</p>
          </div>
        )}

        {error && (
          <div>
            <h1 className="text-2xl font-semibold mb-2 text-red-400">Oops!</h1>
            <p className="text-gray-300">{error}</p>

            {!user && (
              <button
                onClick={() => router.push("/login")}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 transition rounded-md text-white font-medium"
              >
                Login to Continue
              </button>
            )}
          </div>
        )}

        {success && (
          <div>
            <h1 className="text-2xl font-semibold mb-2 text-green-400">
              Welcome aboard! 🌱
            </h1>
            <p className="text-gray-300">
              You’ve successfully joined the workspace. Redirecting you shortly...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


