"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";

export default function Navbar() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const clearUser = useAppStore((s) => s.clearUser);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

 
  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  }, [user, setUser]);

  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  
  }, []);

  const handleLogout = async () => {
    if (!user?.token) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      clearUser();
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/logout";
    }

  };

  return (
    <div className="w-full p-4 border-b flex justify-end items-center bg-white relative z-50 select-none">
      {user?.AvatarURL ? (
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="focus:outline-none"
          >
            
            <img
              src={user.AvatarURL}
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-teal-400 cursor-pointer hover:opacity-90 transition"
              style={{ pointerEvents: "auto", zIndex: 60 }}
            />
          </button>

          {open && (
            <div
              className="absolute right-0 mt-3 bg-white border border-gray-200 rounded-xl shadow-lg z-[100] w-36 py-2"
              style={{ pointerEvents: "auto" }}
            >
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <span className="text-gray-500 text-sm">No Avatar</span>
      )}
    </div>
  );
}



