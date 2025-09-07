"use client";

import useUserStore from "@/lib/store";
import Link from "next/link";
export default function Navbar() {
  const user = useUserStore((s) => s.user);

  return (
    <div className="w-full p-4 border-b flex justify-end items-center">
       <Link href={"/user"}>
      {user?.AvatarURL ? (
        <img
          src={decodeURIComponent(user.AvatarURL)}
          alt="avatar"
          className="w-10 h-10 rounded-full border"
        />
      ) : (
        <span className="text-sm text-gray-500">No Avatar</span>
      )}
      </Link>
    </div>
  );
}
