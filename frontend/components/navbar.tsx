"use client";

import { useState } from "react";
import useAppStore from "@/lib/store";

export default function Navbar() {
  const user = useAppStore((s) => s.user);
  const clearUser = useAppStore((s) => s.clearUser);
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    if (!user?.token) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });

      clearUser();

      // Safe redirect to logout page
      window.location.href = "/logout";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="w-full p-4 border-b flex justify-end items-center relative">
      {user?.avatarURL ? (
        <img
          src={user.avatarURL}
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

