"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function LogoutPage() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.open("", "_self");
      window.close();
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-700">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-teal-600 mb-2">
          Logging you out...
        </h1>
        <p className="text-gray-500">This tab will close automatically.</p>
      </motion.div>
    </div>
  );
}

