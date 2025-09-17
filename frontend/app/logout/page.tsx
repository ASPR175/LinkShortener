"use client";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    
    window.open("", "_self");
    window.close();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-gray-600">
      <p className="mb-4">You have been logged out.</p>
      <p>If this tab didn’t close automatically, you can close it manually.</p>
    </div>
  );
}
