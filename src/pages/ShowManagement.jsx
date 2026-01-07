import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import AddSignupForm from '../components/AddSignupForm'
import styles from '../styles/ShowManagement.module.css'

function ShowManagement({ session }) {
  const { showId } = useParams()
  const [show, setShow] = useState(null)
  const [signups, setSignups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    if (!session) return

    async function fetchData() {
      // Get show with showrunner info
      const { data: showData, error: showError } = await supabase
        .from('shows')
        .select('*, showrunners(id, venue_name, profile_id)')
        .eq('id', showId)
        .single()

      if (showError || !showData) {
        setLoading(false)
        return
      }

      setShow(showData)

      // Check if current user owns this show
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (profile && showData.showrunners?.profile_id === profile.id) {
        setIsOwner(true)
      }

      // Fetch signups
      const { data: signupsData } = await supabase
        .from('show_signups')
        .select('*')
        .eq('show_id', showId)
        .order('created_at', { ascending: true })

      setSignups(signupsData || [])
      setLoading(false)
    }

    fetchData()
  }, [session, showId])

  const handleSignupAdded = (newSignup) => {
    setSignups(prev => [...prev, newSignup])
    setShowAddForm(false)
  }

  const handleStatusChange = async (signupId, newStatus) => {
    const { error } = await supabase
      .from('show_signups')
      .update({ status: newStatus })
      .eq('id', signupId)

    if (!error) {
      setSignups(prev =>
        prev.map(s => s.id === signupId ? { ...s, status: newStatus } : s)
      )
    }
  }

  const handleDelete = async (signupId) => {
    if (!confirm('Remove this signup?')) return

    const { error } = await supabase
      .from('show_signups')
      .delete()
      .eq('id', signupId)

    if (!error) {
      setSignups(prev => prev.filter(s => s.id !== signupId))
    }
  }

  if (!session) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!show) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <Link to="/dashboard" className={styles.backLink}>← Back</Link>
          <h1>Show not found</h1>
        </header>
      </div>
    )
  }

  if (!isOwner) {
    return <Navigate to="/dashboard" replace />
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':')
    const h = parseInt(hours, 10)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${minutes} ${ampm}`
  }

  const onlineSignups = signups.filter(s => s.signup_type === 'online')
  const walkupSignups = signups.filter(s => s.signup_type === 'in_person')

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/dashboard" className={styles.backLink}>← Back to Dashboard</Link>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>{show.title}</h1>
            <p className={styles.subtitle}>
              {formatDate(show.show_date)}
              {show.show_time && ` at ${formatTime(show.show_time)}`}
              {show.venue && ` · ${show.venue}`}
            </p>
          </div>
          <span className={`${styles.status} ${styles[`status_${show.status}`]}`}>
            {show.status.replace('_', ' ')}
          </span>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Signups ({signups.length})</h2>
            <button
              className={styles.addBtn}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : '+ Add Signup'}
            </button>
          </div>

          {showAddForm && (
            <AddSignupForm
              show={show}
              onSignupAdded={handleSignupAdded}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {signups.length === 0 ? (
            <p className={styles.empty}>No signups yet</p>
          ) : (
            <div className={styles.signupGroups}>
              {onlineSignups.length > 0 && (
                <div className={styles.signupGroup}>
                  <h3 className={styles.groupTitle}>
                    Online ({onlineSignups.length})
                  </h3>
                  <ul className={styles.signupList}>
                    {onlineSignups.map((signup, index) => (
                      <SignupRow
                        key={signup.id}
                        signup={signup}
                        index={index + 1}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                      />
                    ))}
                  </ul>
                </div>
              )}

              {walkupSignups.length > 0 && (
                <div className={styles.signupGroup}>
                  <h3 className={styles.groupTitle}>
                    Walk-ups ({walkupSignups.length})
                  </h3>
                  <ul className={styles.signupList}>
                    {walkupSignups.map((signup, index) => (
                      <SignupRow
                        key={signup.id}
                        signup={signup}
                        index={index + 1}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function SignupRow({ signup, index, onStatusChange, onDelete }) {
  return (
    <li className={styles.signupRow}>
      <span className={styles.signupIndex}>{index}</span>
      <div className={styles.signupInfo}>
        <span className={styles.signupName}>{signup.display_name}</span>
        <span className={styles.signupEmail}>{signup.email}</span>
        {signup.notes && (
          <span className={styles.signupNotes}>{signup.notes}</span>
        )}
      </div>
      <span className={styles.signupLength}>{signup.preferred_set_length}m</span>
      <select
        className={`${styles.statusSelect} ${styles[`status_${signup.status}`]}`}
        value={signup.status}
        onChange={(e) => onStatusChange(signup.id, e.target.value)}
      >
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="waitlist">Waitlist</option>
        <option value="cancelled">Cancelled</option>
        <option value="no_show">No Show</option>
      </select>
      <button
        className={styles.deleteBtn}
        onClick={() => onDelete(signup.id)}
        title="Remove signup"
      >
        ×
      </button>
    </li>
  )
}

export default ShowManagement
