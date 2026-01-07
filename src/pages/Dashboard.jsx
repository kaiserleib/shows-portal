import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import ShowrunnerRegistration from '../components/ShowrunnerRegistration'

function Dashboard({ session }) {
  const [showrunner, setShowrunner] = useState(null)
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return

    async function fetchShowrunnerData() {
      // Check if user is a showrunner
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (profile) {
        const { data: showrunnerData } = await supabase
          .from('showrunners')
          .select('*')
          .eq('profile_id', profile.id)
          .single()

        if (showrunnerData) {
          setShowrunner(showrunnerData)

          // Fetch their shows with signup counts
          const { data: showsData } = await supabase
            .from('shows')
            .select('*, show_signups(count)')
            .eq('showrunner_id', showrunnerData.id)
            .order('show_date', { ascending: true })

          setShows(showsData || [])
        }
      }

      setLoading(false)
    }

    fetchShowrunnerData()
  }, [session])

  const handleRegistrationComplete = (newShowrunner) => {
    setShowrunner(newShowrunner)
    setShows([])
  }

  if (!session) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!showrunner) {
    return (
      <div className="dashboard">
        <header>
          <Link to="/">← Back</Link>
        </header>
        <ShowrunnerRegistration
          session={session}
          onComplete={handleRegistrationComplete}
        />
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header>
        <Link to="/">← Back</Link>
        <h1>Showrunner Dashboard</h1>
      </header>

      <main>
        <section className="shows-section">
          <div className="section-header">
            <h2>Your Shows</h2>
            <Link to="/dashboard/shows/new" className="create-show-btn">+ Create Show</Link>
          </div>

          {shows.length === 0 ? (
            <p>No shows yet. Create your first show!</p>
          ) : (
            <ul className="shows-list">
              {shows.map(show => {
                const signupCount = show.show_signups?.[0]?.count || 0
                return (
                  <li key={show.id} className="show-item">
                    <Link to={`/dashboard/shows/${show.id}`}>
                      <h3>{show.title}</h3>
                      <p>
                        {new Date(show.show_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                        <span className="signup-count"> · {signupCount} signup{signupCount !== 1 ? 's' : ''}</span>
                      </p>
                      <span className={`status status-${show.status}`}>{show.status.replace('_', ' ')}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

export default Dashboard
