import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { supabase } from './supabaseClient'
import LandingPage from './pages/LandingPage'
import ShowPage from './pages/ShowPage'
import Dashboard from './pages/Dashboard'
import CreateShow from './pages/CreateShow'
import ShowManagement from './pages/ShowManagement'
import MySignups from './pages/MySignups'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for auth errors in URL hash
    const hash = window.location.hash
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1))
      const error = hashParams.get('error')
      if (error) {
        window.history.replaceState({}, '', window.location.pathname)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage session={session} />} />
      <Route path="/s/:showId" element={<ShowPage session={session} />} />

      {/* Authenticated routes */}
      <Route path="/dashboard" element={<Dashboard session={session} />} />
      <Route path="/dashboard/shows/new" element={<CreateShow session={session} />} />
      <Route path="/dashboard/shows/:showId" element={<ShowManagement session={session} />} />
      <Route path="/my-signups" element={<MySignups session={session} />} />
    </Routes>
  )
}

export default App
