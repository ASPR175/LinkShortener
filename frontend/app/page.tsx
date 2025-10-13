"use client";

import { motion } from "framer-motion";
import {ReactTyped} from "react-typed";
import { BarChart2, Link2, Users, Zap, Github, Twitter } from "lucide-react";
import { SiNextdotjs, SiMongodb, SiGoland, SiGithub, SiX } from "react-icons/si";

export default function HomePage() {
  const features = [
    {
      title: "Advanced Analytics",
      icon: BarChart2,
      desc: "Get **detailed insights** on every click, referrer, and location 🌟 with beautiful real-time graphs.",
      gradient: "from-teal-200 via-teal-300 to-teal-400"
    },
    {
      title: "Smart Link Management",
      icon: Link2,
      desc: "Organize, **customize**, and control your links easily 📌 with sleek dashboards.",
      gradient: "from-orange-200 via-orange-300 to-orange-400"
    },
    {
      title: "Team Workspaces",
      icon: Users,
      desc: "Collaborate with your **team** 🤝 to manage links, analyze data, and grow together.",
      gradient: "from-purple-200 via-purple-300 to-purple-400"
    },
    {
      title: "Real-Time Insights",
      icon: Zap,
      desc: "Watch **performance metrics** update live ⚡ as your audience interacts.",
      gradient: "from-blue-200 via-blue-300 to-blue-400"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-teal-50/30 to-white text-gray-800 relative overflow-hidden">
      
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-300 blur-[160px] opacity-40 rounded-full"></div>

      
      <nav className="flex justify-between items-center px-8 py-5 z-10 relative">
        <h1 className="text-3xl font-extrabold text-teal-600">Linkly</h1>
        <a
          href="/login"
          className="px-5 py-2 bg-teal-600 text-white rounded-xl shadow hover:bg-teal-700 transition-all duration-200"
        >
          Get Started
        </a>
      </nav>

    
      <main className="flex flex-col items-center justify-center text-center flex-1 px-6 mt-10">
        <h2 className="text-5xl md:text-6xl font-extrabold mb-4">
          Shorten. Track. Analyze. <span className="text-teal-600">🚀</span>
        </h2>

        <ReactTyped
          
          strings={["Linkly.", "View Analytics.", "Create Workspaces.", "Manage Your Links."]}
          typeSpeed={70}
          backSpeed={40}
          loop
          className="text-xl md:text-2xl text-gray-600 mb-10"
        />

        <div className="flex gap-4 mt-4">
          <a
            href="https://github.com/ASPR175/LinkShortener"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-lg shadow-md hover:bg-gray-800 transition"
          >
            <SiGithub /> GitHub
          </a>
          <a
            href="https://x.com/NotSnorgo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-black transition"
          >
            <SiX/> X
          </a>
        </div>
      </main>

      
      <section className="flex flex-col gap-16 px-6 py-20">
        {features.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className={`flex flex-col md:flex-row ${
                i % 2 === 1 ? "md:flex-row-reverse" : ""
              } items-center justify-center gap-6`}
            >
              
              <motion.div
                className={`w-64 h-64 flex justify-center items-center rounded-full shadow-xl bg-gradient-to-br ${card.gradient} flex-shrink-0`}
                animate={{ boxShadow: ["0 0 20px rgba(13,148,136,0.2)", "0 0 50px rgba(13,148,136,0.4)", "0 0 20px rgba(13,148,136,0.2)"] }}
                transition={{ repeat: Infinity, duration: 4 }}
              >
                <Icon className="text-white w-12 h-12" />
              </motion.div>

              
              <div className="max-w-s text-center md:text-left flex-shrink-0">
                <h3 className="text-2xl font-bold text-teal-600 mb-3">{card.title}</h3>
                <p className="text-gray-700 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: card.desc }} />
              </div>
            </motion.div>
          );
        })}
      </section>

      
      <section className="py-10 bg-gradient-to-r from-teal-50 to-white text-center">
        <h4 className="text-xl font-semibold text-gray-700 mb-6">Built With ⚙️</h4>
        <div className="flex justify-center gap-8 text-4xl text-teal-600">
          <motion.div whileHover={{ scale: 1.2 }}><SiGoland title="Golang" /></motion.div>
          <motion.div whileHover={{ scale: 1.2 }}><SiNextdotjs title="Next.js" /></motion.div>
          <motion.div whileHover={{ scale: 1.2 }}><SiMongodb title="MongoDB" /></motion.div>
        </div>
      </section>

      
      <footer className="text-center text-gray-500 text-sm py-6">
        © {new Date().getFullYear()} Linkly — crafted with ☕ & 💚 by Atharva
      </footer>
    </div>
  );
}




