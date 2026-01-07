import { useState } from 'react'
import { supabase } from '../supabaseClient'
import styles from '../styles/AddSignupForm.module.css'

function AddSignupForm({ show, onSignupAdded, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    signup_type: 'in_person',
    preferred_set_length: show.set_length_options?.[0] || 5,
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check for existing signup with same email
    const { data: existing } = await supabase
      .from('show_signups')
      .select('id')
      .eq('show_id', show.id)
      .eq('email', formData.email.toLowerCase())
      .single()

    if (existing) {
      setError('This email is already signed up for this show')
      setLoading(false)
      return
    }

    // Look up profile by email for linking
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', formData.email.toLowerCase())
      .single()

    const { data: signup, error: insertError } = await supabase
      .from('show_signups')
      .insert({
        show_id: show.id,
        profile_id: profile?.id || null,
        display_name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        signup_type: formData.signup_type,
        preferred_set_length: parseInt(formData.preferred_set_length, 10),
        notes: formData.notes.trim() || null,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    onSignupAdded(signup)
    setFormData({
      name: '',
      email: '',
      signup_type: 'in_person',
      preferred_set_length: show.set_length_options?.[0] || 5,
      notes: ''
    })
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Name *</label>
          <input
            type="text"
            name="name"
            className={styles.input}
            value={formData.name}
            onChange={handleChange}
            placeholder="Comic's name"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email *</label>
          <input
            type="email"
            name="email"
            className={styles.input}
            value={formData.email}
            onChange={handleChange}
            placeholder="comic@example.com"
            required
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Type</label>
          <select
            name="signup_type"
            className={styles.select}
            value={formData.signup_type}
            onChange={handleChange}
          >
            <option value="online">Online (pre-sign)</option>
            <option value="in_person">Walk-up</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Set Length</label>
          <select
            name="preferred_set_length"
            className={styles.select}
            value={formData.preferred_set_length}
            onChange={handleChange}
          >
            {(show.set_length_options || [5]).map(len => (
              <option key={len} value={len}>{len} min</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Notes</label>
        <input
          type="text"
          name="notes"
          className={styles.input}
          value={formData.notes}
          onChange={handleChange}
          placeholder="Optional notes..."
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        {onCancel && (
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading || !formData.name.trim() || !formData.email.trim()}
        >
          {loading ? 'Adding...' : 'Add Signup'}
        </button>
      </div>
    </form>
  )
}

export default AddSignupForm
