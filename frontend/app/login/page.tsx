"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { SiGoogle, SiGithub } from "react-icons/si";

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 relative overflow-hidden">
      
      {/* Ambient blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-300 blur-[160px] opacity-40 rounded-full"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-300 blur-[160px] opacity-40 rounded-full"></div>

      
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-40 bg-teal-200/30 rounded-full blur-xl"></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-40 bg-teal-200/30 rounded-full blur-xl"></div>

      
      <div className="relative z-10 flex flex-col items-center bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-16 min-h-[50vh] w-72 md:w-80 lg:w-96 space-y-10">
        <h1 className="text-3xl font-extrabold text-teal-600 text-center">Welcome Back!</h1>
        <p className="text-gray-700 text-center text-lg">
          Login to your account and manage your links effortlessly.
        </p>

        <button
          onClick={() => (window.location.href = `${backendURL}/auth/google`)}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold shadow-md hover:bg-red-600 transition-all duration-200 cursor-pointer"
        >
          <SiGoogle className="w-6 h-6" /> Login with Google
        </button>

        <button
          onClick={() => (window.location.href = `${backendURL}/auth/github`)}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold shadow-md hover:bg-gray-800 transition-all duration-200 cursor-pointer"
        >
          <SiGithub className="w-6 h-6" /> Login with GitHub
        </button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          By logging in you agree to our <span className="text-teal-600 underline cursor-pointer">Terms & Conditions</span>
        </p>
      </div>
    </div>
  );
}

