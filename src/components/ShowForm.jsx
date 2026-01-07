import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import styles from '../styles/ShowForm.module.css'

const SIGNUP_STRATEGIES = [
  { value: 'curated', label: 'Curated', description: 'You manually select and order performers' },
  { value: 'numbered', label: 'Numbered', description: 'Online gets even numbers, walk-ups get odd' },
  { value: 'bucket', label: 'Bucket (Lottery)', description: 'Random selection from all signups' }
]

const DEFAULT_SET_LENGTHS = [3, 5, 7]

function ShowForm({ showrunner, existingShow, onSave }) {
  const navigate = useNavigate()
  const isEditing = !!existingShow

  const [formData, setFormData] = useState({
    title: existingShow?.title || '',
    description: existingShow?.description || '',
    venue: existingShow?.venue || showrunner?.venue_name || '',
    address: existingShow?.address || '',
    show_date: existingShow?.show_date || '',
    show_time: existingShow?.show_time || '',
    doors_time: existingShow?.doors_time || '',
    signup_strategy: existingShow?.signup_strategy || 'curated',
    max_signups: existingShow?.max_signups || '',
    set_length_options: existingShow?.set_length_options || DEFAULT_SET_LENGTHS,
    status: existingShow?.status || 'draft'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSetLengthToggle = (length) => {
    setFormData(prev => {
      const current = prev.set_length_options || []
      if (current.includes(length)) {
        return { ...prev, set_length_options: current.filter(l => l !== length) }
      } else {
        return { ...prev, set_length_options: [...current, length].sort((a, b) => a - b) }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const showData = {
      showrunner_id: showrunner.id,
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      venue: formData.venue.trim() || null,
      address: formData.address.trim() || null,
      show_date: formData.show_date,
      show_time: formData.show_time || null,
      doors_time: formData.doors_time || null,
      signup_strategy: formData.signup_strategy,
      max_signups: formData.max_signups ? parseInt(formData.max_signups, 10) : null,
      set_length_options: formData.set_length_options,
      status: formData.status
    }

    try {
      let result
      if (isEditing) {
        result = await supabase
          .from('shows')
          .update(showData)
          .eq('id', existingShow.id)
          .select()
          .single()
      } else {
        result = await supabase
          .from('shows')
          .insert(showData)
          .select()
          .single()
      }

      if (result.error) throw result.error

      if (onSave) {
        onSave(result.data)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Error saving show:', err)
      setError(err.message || 'Failed to save show')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Basic Info</h3>

        <div className={styles.field}>
          <label className={styles.label}>Show Title *</label>
          <input
            type="text"
            name="title"
            className={styles.input}
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Tuesday Night Open Mic"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            name="description"
            className={styles.textarea}
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell comics about your show..."
            rows={3}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Venue</label>
            <input
              type="text"
              name="venue"
              className={styles.input}
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g., The Comedy Store"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Address</label>
            <input
              type="text"
              name="address"
              className={styles.input}
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g., 123 Main St, San Francisco"
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Date & Time</h3>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Show Date *</label>
            <input
              type="date"
              name="show_date"
              className={styles.input}
              value={formData.show_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Show Time</label>
            <input
              type="time"
              name="show_time"
              className={styles.input}
              value={formData.show_time}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Doors Time</label>
            <input
              type="time"
              name="doors_time"
              className={styles.input}
              value={formData.doors_time}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Signup Settings</h3>

        <div className={styles.field}>
          <label className={styles.label}>Signup Strategy</label>
          <div className={styles.strategyOptions}>
            {SIGNUP_STRATEGIES.map(strategy => (
              <label
                key={strategy.value}
                className={`${styles.strategyOption} ${formData.signup_strategy === strategy.value ? styles.strategySelected : ''}`}
              >
                <input
                  type="radio"
                  name="signup_strategy"
                  value={strategy.value}
                  checked={formData.signup_strategy === strategy.value}
                  onChange={handleChange}
                  className={styles.radioInput}
                />
                <span className={styles.strategyLabel}>{strategy.label}</span>
                <span className={styles.strategyDescription}>{strategy.description}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Max Signups</label>
          <input
            type="number"
            name="max_signups"
            className={styles.inputSmall}
            value={formData.max_signups}
            onChange={handleChange}
            placeholder="Unlimited"
            min="1"
          />
          <p className={styles.hint}>Leave blank for unlimited signups</p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Set Length Options (minutes)</label>
          <div className={styles.setLengthOptions}>
            {[3, 5, 7, 10, 15].map(length => (
              <button
                key={length}
                type="button"
                className={`${styles.setLengthBtn} ${formData.set_length_options?.includes(length) ? styles.setLengthSelected : ''}`}
                onClick={() => handleSetLengthToggle(length)}
              >
                {length}
              </button>
            ))}
          </div>
          <p className={styles.hint}>Comics will choose from these options when signing up</p>
        </div>
      </section>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => navigate('/dashboard')}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading || !formData.title.trim() || !formData.show_date}
        >
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Show'}
        </button>
      </div>
    </form>
  )
}

export default ShowForm
