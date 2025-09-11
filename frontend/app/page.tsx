"use client";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      
      <nav className="flex justify-between items-center px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold">Linkly</h1>
        <a
          href="/login"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Get Started
        </a>
      </nav>

      
      <main className="flex flex-col items-center justify-center flex-1 text-center px-6">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
          Shorten. Track. Analyze. 🚀
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          A modern open-source link shortener with analytics, workspaces, and
          team collaboration. Built with Fiber, Next.js, and MongoDB.
        </p>

        <div className="flex space-x-4">
         
          <a
            href="https://github.com/ASPR175/LinkShortener"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border rounded-lg shadow hover:bg-gray-100 transition"
          >
            View on GitHub
          </a>

          
          <a
            href="/login"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Get Started
          </a>
        </div>
      </main>

      
      <footer className="text-center text-gray-500 text-sm py-6">
        © {new Date().getFullYear()} Linkly. Made with ❤️ by Atharva.
      </footer>
    </div>
  );
}


