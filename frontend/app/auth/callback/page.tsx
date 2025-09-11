"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAppStore from "@/lib/store";

export default function AuthCallbackPage() {
  const setUser = useAppStore((s) => s.setUser);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Logging you in...");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true); 
  }, []);
  useEffect(() => {
    if(!hydrated){
      return 
    }
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userStr));

        
        let avatar = parsedUser.AvatarURL;
        if (avatar) {
          try {
            avatar = decodeURIComponent(avatar);
          } catch {
            
          }
        }

        const userData = { ...parsedUser, AvatarURL: avatar, token };

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
      setStatus("Missing credentials. Redirecting...");
      setTimeout(() => router.replace("/"), 1500);
    }
  }, [searchParams, router, setUser]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto"></div>
        <p className="text-lg font-medium">{status}</p>
      </div>
    </div>
  );
}





