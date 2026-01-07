import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

// eslint-disable-next-line no-unused-vars
function ShowPage({ session }) {
  const { showId } = useParams()
  const [show, setShow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchShow() {
      const { data, error } = await supabase
        .from('shows')
        .select('*, showrunners(*, profiles(display_name))')
        .eq('id', showId)
        .single()

      if (error) {
        setError('Show not found')
      } else {
        setShow(data)
      }
      setLoading(false)
    }

    fetchShow()
  }, [showId])

  if (loading) {
    return <div className="loading">Loading show...</div>
  }

  if (error || !show) {
    return (
      <div className="error-page">
        <h1>Show not found</h1>
        <Link to="/">Back to shows</Link>
      </div>
    )
  }

  return (
    <div className="show-page">
      <header>
        <Link to="/">← Back to shows</Link>
      </header>

      <main>
        <h1>{show.title}</h1>
        <p className="show-date">
          {new Date(show.show_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
          {show.show_time && ` at ${show.show_time}`}
        </p>

        {show.venue && <p className="venue">{show.venue}</p>}
        {show.description && <p className="description">{show.description}</p>}

        <section className="signup-section">
          <h2>Sign Up</h2>
          <p>Signup form coming soon...</p>
        </section>
      </main>
    </div>
  )
}

export default ShowPage
