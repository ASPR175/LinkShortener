"use client";
import { useEffect, useState } from "react";

export default function OAuthCallback() {
  const [authData, setAuthData] = useState<any>(null);

  useEffect(() => {
    
    fetch(window.location.href, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setAuthData(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-xl font-bold">OAuth Callback</h1>

      {authData ? (
        <pre className="mt-6 bg-gray-800 p-4 rounded-lg text-sm w-[500px] overflow-x-auto">
          {JSON.stringify(authData, null, 2)}
        </pre>
      ) : (
        <p className="mt-6">Waiting for OAuth response...</p>
      )}
    </main>
  );
}
