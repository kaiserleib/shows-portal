import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function MySignups({ session }) {
  const [signups, setSignups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return

    async function fetchSignups() {
      // Get user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (profile) {
        // Fetch their signups with show details
        const { data } = await supabase
          .from('show_signups')
          .select('*, shows(*)')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false })

        setSignups(data || [])
      }

      setLoading(false)
    }

    fetchSignups()
  }, [session])

  if (!session) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="my-signups">
      <header>
        <Link to="/">← Back</Link>
        <h1>My Signups</h1>
      </header>

      <main>
        {signups.length === 0 ? (
          <p>You haven't signed up for any shows yet.</p>
        ) : (
          <ul className="signups-list">
            {signups.map(signup => (
              <li key={signup.id} className="signup-item">
                <Link to={`/s/${signup.show_id}`}>
                  <h3>{signup.shows?.title || 'Unknown Show'}</h3>
                  <p>
                    {signup.shows?.show_date &&
                      new Date(signup.shows.show_date).toLocaleDateString()
                    }
                  </p>
                  <span className={`status status-${signup.status}`}>
                    {signup.status}
                  </span>
                  {signup.lineup_position && (
                    <span className="position">#{signup.lineup_position}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

export default MySignups
