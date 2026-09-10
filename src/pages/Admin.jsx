import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { LogOut } from 'lucide-react'
import LoginForm from '../components/admin/LoginForm'
import ProfileTab from '../components/admin/ProfileTab'
import NewsTab from '../components/admin/NewsTab'
import PublicationsTab from '../components/admin/PublicationsTab'
import CVTab from '../components/admin/CVTab'
import BlogsTab from '../components/admin/BlogsTab'

export default function Admin() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
      setUser(null)
      setActiveTab('profile')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLoginSuccess={() => checkAuth()} />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex gap-1 mb-8 border-b-2 border-gray-200 overflow-x-auto bg-white rounded-t-lg">
          {['profile', 'news', 'publications', 'cv', 'blogs'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold capitalize whitespace-nowrap transition ${
                activeTab === tab
                  ? 'text-cyan-600 border-b-3 border-cyan-600 bg-cyan-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'news' && <NewsTab />}
          {activeTab === 'publications' && <PublicationsTab />}
          {activeTab === 'cv' && <CVTab />}
          {activeTab === 'blogs' && <BlogsTab />}
        </div>
      </div>
    </div>
  )
}
