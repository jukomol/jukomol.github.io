import { Outlet, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Jahir Uddin
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden hover:text-cyan-400 transition"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={`hidden md:flex gap-8 items-center`}>
              <Link to="/" className="hover:text-cyan-400 transition font-medium">Home</Link>
              <Link to="/cv" className="hover:text-cyan-400 transition font-medium">CV</Link>
              <Link to="/publications" className="hover:text-cyan-400 transition font-medium">Publications</Link>
              <Link to="/blog" className="hover:text-cyan-400 transition font-medium">Blog</Link>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden flex flex-col gap-4 mt-4 pb-4 border-t border-slate-700 pt-4">
              <Link to="/" className="hover:text-cyan-400 transition font-medium" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/cv" className="hover:text-cyan-400 transition font-medium" onClick={() => setMenuOpen(false)}>CV</Link>
              <Link to="/publications" className="hover:text-cyan-400 transition font-medium" onClick={() => setMenuOpen(false)}>Publications</Link>
              <Link to="/blog" className="hover:text-cyan-400 transition font-medium" onClick={() => setMenuOpen(false)}>Blog</Link>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="mb-2 font-semibold">Jahir Uddin © 2024</p>
          <p className="text-gray-400">University of Nebraska Medical Center | Department of Environmental, Agricultural, and Occupational Health</p>
        </div>
      </footer>
    </div>
  )
}
