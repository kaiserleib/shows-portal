import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import ShowForm from '../components/ShowForm'
import styles from '../styles/CreateShow.module.css'

function CreateShow({ session }) {
  const [showrunner, setShowrunner] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return

    async function fetchShowrunner() {
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

        setShowrunner(showrunnerData)
      }

      setLoading(false)
    }

    fetchShowrunner()
  }, [session])

  if (!session) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!showrunner) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/dashboard" className={styles.backLink}>← Back to Dashboard</Link>
        <h1 className={styles.title}>Create New Show</h1>
      </header>

      <main className={styles.main}>
        <ShowForm showrunner={showrunner} />
      </main>
    </div>
  )
}

export default CreateShow
