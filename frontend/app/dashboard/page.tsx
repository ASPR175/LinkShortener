"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { useAppStore } from "@/lib/store";
import {ReactTyped} from "react-typed";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Particles from "react-tsparticles";
import { Users, Link, BarChart as BarIcon, Activity } from "lucide-react";

export default function DashboardPage() {
  const user = useAppStore((s) => s.user);
  const workspaces = useAppStore((s) => s.workspaces);
  const router = useRouter();


  if (!user) return <div>Please login first</div>;


const getRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const stats = [
  { title: "Total Links", value: getRandom(100, 200), icon: <Link className="w-8 h-8 text-teal-500" /> },
  { title: "Clicks Today", value: getRandom(300, 600), icon: <BarIcon className="w-8 h-8 text-teal-500" /> },
  { title: "Workspaces", value: getRandom(1, 5), icon: <Users className="w-8 h-8 text-teal-500" /> },
  { title: "Team Members", value: getRandom(5, 20), icon: <Activity className="w-8 h-8 text-teal-500" /> },
];


const fakeData = Array.from({ length: 7 }).map((_, i) => ({
  name: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
  clicks: getRandom(100, 400),
}));

  return (
    <div className="flex h-screen bg-gray-50 relative overflow-hidden">
      
      <Particles
        className="absolute inset-0 z-0"
        options={{
          particles: {
            number: { value: 60 },
            size: { value: 3 },
            move: { speed: 0.8 },
            color: { value: "#14B8A6" },
            opacity: { value: 0.5 },
            line_linked: { enable: true, distance: 150, color: "#14B8A6", opacity: 0.2 },
          },
        }}
      />

      
      <Sidebar />

     
      <div className="flex flex-col flex-1 z-10">
        <Navbar />

        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-teal-500 text-white rounded-xl p-6 mx-8 mt-6 shadow-lg"
        >
          <h1 className="text-3xl font-extrabold">Welcome, {user.Name} 👋</h1>
          <p className="mt-2 text-white/80 text-lg">
            <ReactTyped
              strings={[
                "Manage your links effortlessly.",
                "Track clicks in real-time.",
                "Collaborate with your team.",
              ]}
              typeSpeed={50}
              backSpeed={30}
              loop
            />
          </p>
        </motion.div>

      
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 mx-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl p-6 flex flex-col items-center justify-center shadow hover:shadow-lg transition"
            >
              {stat.icon}
              <h3 className="mt-2 text-lg font-semibold">{stat.title}</h3>
              <p className="mt-1 text-teal-500 font-bold text-xl">{stat.value}</p>
            </motion.div>
          ))}
        </div>

       
        <div className="bg-white rounded-xl shadow p-6 mt-8 mx-8">
          <h2 className="text-xl font-bold mb-4">Clicks This Week</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={fakeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="clicks" fill="#14B8A6" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      
        <div className="flex gap-4 mt-8 mx-8 mb-8">
             
         <motion.button
  whileHover={{ scale: 1.05 }}
  onClick={() => router.push("/links")}
  className="bg-teal-500 text-white px-6 py-3 rounded-lg shadow hover:bg-teal-600 transition"
>
  Create New Link
</motion.button>

        </div>

       
        <div className="flex gap-6 justify-center mt-4 mb-8">
          {["GO", "Next.js", "MongoDB"].map((tech, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.1 }}
              className="bg-white rounded-full px-6 py-3 shadow cursor-pointer hover:shadow-lg transition"
            >
              {tech}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

