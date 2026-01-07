import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import LoginForm from '../components/LoginForm'

function LandingPage({ session }) {
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="landing-page">
      <header className="header">
        <h1>302 Comedy Shows</h1>
        <nav>
          {session ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/my-signups">My Signups</Link>
              <button onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <button onClick={() => setShowLoginModal(true)}>Log In</button>
          )}
        </nav>
      </header>

      {showLoginModal && (
        <LoginForm onClose={() => setShowLoginModal(false)} />
      )}

      <main>
        <section className="hero">
          <h2>Find and sign up for comedy shows</h2>
          <p>Open mics, showcases, and more in the Bay Area</p>
        </section>

        <section className="upcoming-shows">
          <h3>Upcoming Shows</h3>
          <p>Coming soon...</p>
        </section>
      </main>
    </div>
  )
}

export default LandingPage
