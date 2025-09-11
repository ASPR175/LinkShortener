"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAppStore from "@/lib/store";

export default function LoginPage() {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      setUser(JSON.parse(userStr));
      router.push("/dashboard"); 
    }
  }, [router, setUser]);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-xl font-bold">Login</h1>
      <button
        className="p-2 border rounded"
        onClick={() => (window.location.href = `${backendURL}/auth/google`)}
      >
        Login with Google
      </button>
      <button
        className="p-2 border rounded"
        onClick={() => (window.location.href = `${backendURL}/auth/github`)}
      >
        Login with GitHub
      </button>
    </div>
  );
}