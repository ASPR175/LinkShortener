"use client";
import { useState } from "react";

export default function Home() {
  const [authData, setAuthData] = useState<any>(null);

  const handleLogin = (provider: "google" | "github") => {
    window.location.href = `http://localhost:8080/auth/${provider}`;
  };

  
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-6">OAuth Tester</h1>

      <div className="flex gap-4">
        <button
          onClick={() => handleLogin("google")}
          className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600"
        >
          Login with Google
        </button>

        <button
          onClick={() => handleLogin("github")}
          className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-800"
        >
          Login with GitHub
        </button>
      </div>

      {authData && (
        <pre className="mt-8 bg-gray-800 p-4 rounded-lg text-sm w-[500px] overflow-x-auto">
          {JSON.stringify(authData, null, 2)}
        </pre>
      )}
    </main>
  );
}
