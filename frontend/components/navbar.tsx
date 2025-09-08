"use client";

import { useState } from "react";
import useUserStore from "@/lib/store";




export default function Navbar() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser); 
  const [open, setOpen] = useState(false);
 
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user?.token}`,
        },
      });

      
      clearUser();
    
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="w-full p-4 border-b flex justify-end items-center relative">
      {user?.AvatarURL ? (
        <img
           src={user.AvatarURL}
          alt="avatar"
          className="w-10 h-10 rounded-full border cursor-pointer"
          onClick={() => setOpen(!open)}
        />
      ) : (
        <span className="text-sm text-gray-500">No Avatar</span>
      )}

      {open && (
        <div className="absolute right-4 mt-12 bg-white border rounded shadow-md">
          <button
            className="px-4 py-2 w-full text-left hover:bg-gray-100"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

