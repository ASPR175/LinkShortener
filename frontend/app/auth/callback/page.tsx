
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAppStore from "@/lib/store";

export default function AuthCallbackPage() {
  const setUser = useAppStore((s) => s.setUser);
  const router = useRouter();
  const searchParams = useSearchParams();

 useEffect(() => {
  const token = searchParams.get("token");
  const userStr = searchParams.get("user");

  if (token && userStr) {
    try {
      const userFromBackend = JSON.parse(decodeURIComponent(userStr));

      
      let avatar = userFromBackend.AvatarURL;
      if (avatar) {
        try {
          avatar = decodeURIComponent(avatar);
        } catch {
   
        }
      }

      const userData = { ...userFromBackend, AvatarURL: avatar, token };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      router.replace("/dashboard");
    } catch (err) {
      console.error("Failed to parse user:", err);
      router.replace("/");
    }
  } else {
    router.replace("/");
  }
}, [searchParams, router, setUser]);


  return <div>Logging you in...</div>;
}




