import { useState } from 'react'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const SETTINGS_URL = `${import.meta.env.VITE_API_URL || ''}/settings`

export default function SettingsTab({
  holidays,
  setHolidays,
  shiftConfig,
  setShiftConfig,
  token,
}) {
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  const toggleHoliday = (day) => {
    setHolidays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setStatus('')
    try {
      const res = await fetch(SETTINGS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shiftConfig, holidays }),
      })
      if (!res.ok) {
        setStatus('Failed to save settings')
        return
      }
      setStatus('Settings saved')
    } catch {
      setStatus('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="settings-tab">
      <section className="settings-section">
        <h2>Working Shift</h2>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="shiftStart">Shift Start</label>
            <input
              id="shiftStart"
              type="time"
              value={shiftConfig.shiftStart}
              onChange={(e) =>
                setShiftConfig((prev) => ({ ...prev, shiftStart: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="shiftEnd">Shift End</label>
            <input
              id="shiftEnd"
              type="time"
              value={shiftConfig.shiftEnd}
              onChange={(e) =>
                setShiftConfig((prev) => ({ ...prev, shiftEnd: e.target.value }))
              }
            />
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>Holidays (Weekly Off Days)</h2>
        <p className="section-desc">Select which days of the week are holidays</p>
        <div className="day-selector">
          {DAYS.map((day) => (
            <button
              key={day}
              className={`day-chip ${holidays.includes(day) ? 'selected' : ''}`}
              onClick={() => toggleHoliday(day)}
            >
              {day.slice(0, 3).toUpperCase()}
            </button>
          ))}
        </div>
        {holidays.length > 0 && (
          <p className="selected-summary">
            {holidays.length} day{holidays.length !== 1 ? 's' : ''} selected: {holidays.join(', ')}
          </p>
        )}
      </section>

      <div className="save-row">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {status && <span className="save-status">{status}</span>}
      </div>
    </div>
  )
}
