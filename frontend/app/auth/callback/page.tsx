"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import useUserStore from "@/lib/store";

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        setUser(user); 
        localStorage.setItem("token", token);
      } catch (e) {
        console.error("Failed to parse user:", e);
      }
    }

   
    window.location.href = "/dashboard";
  }, [searchParams, setUser]);

  return <div>Logging you in...</div>;
}



