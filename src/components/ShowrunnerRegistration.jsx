import { useState } from 'react'
import { supabase } from '../supabaseClient'
import styles from '../styles/ShowrunnerRegistration.module.css'

function ShowrunnerRegistration({ session, onComplete }) {
  const [venueName, setVenueName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // First, check if user has a profile
      let { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      // If no profile, create one
      if (!profile) {
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: session.user.id,
            email: session.user.email,
            display_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0]
          })
          .select('id')
          .single()

        if (profileError) throw profileError
        profile = newProfile
      }

      // Create showrunner record
      const { data: showrunner, error: showrunnerError } = await supabase
        .from('showrunners')
        .insert({
          profile_id: profile.id,
          venue_name: venueName.trim(),
          bio: bio.trim() || null
        })
        .select()
        .single()

      if (showrunnerError) throw showrunnerError

      onComplete(showrunner)
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.message || 'Failed to create showrunner profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Become a Showrunner</h2>
        <p className={styles.subtitle}>
          Set up your profile to start creating and managing shows.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Venue / Show Name *</label>
            <input
              type="text"
              className={styles.input}
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="e.g., Bone Dry Comedy, The Punchline"
              required
            />
            <p className={styles.hint}>
              This will be displayed on your shows
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Bio (optional)</label>
            <textarea
              className={styles.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell comics about your show..."
              rows={3}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !venueName.trim()}
          >
            {loading ? 'Creating...' : 'Create Showrunner Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ShowrunnerRegistration
