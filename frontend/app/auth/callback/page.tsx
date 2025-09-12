"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAppStore from "@/lib/store";

export default function AuthCallbackPage() {
  const setUser = useAppStore((s) => s.setUser);
  const router = useRouter();
  const [status, setStatus] = useState("Logging you in...");

  useEffect(() => {
 
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userStr = params.get("user");

    if (token && userStr) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userStr));
        const userData = { ...parsedUser, token };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        setStatus("Redirecting to dashboard...");
        router.replace("/dashboard");
      } catch (err) {
        console.error("❌ Failed to parse user from callback:", err);
        setStatus("Login failed. Redirecting...");
        setTimeout(() => router.replace("/"), 1500);
      }
    } else {
      console.warn("Missing token or user in callback URL");
      setStatus("Missing credentials. Redirecting...");
      setTimeout(() => router.replace("/"), 1500);
    }
  }, [router, setUser]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto"></div>
        <p className="text-lg font-medium">{status}</p>
      </div>
    </div>
  );
}






