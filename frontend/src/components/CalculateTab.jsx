import { useState } from 'react'

const API_URL = `${import.meta.env.VITE_API_URL || ''}/shift/calculate`

export default function CalculateTab({ shiftConfig, holidays }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState(shiftConfig.shiftStart)
  const [endTime, setEndTime] = useState(shiftConfig.shiftEnd)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCalculate = async () => {
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          startTime,
          endTime,
          shiftConfig,
          holidays,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setResult(data)
    } catch {
      setError('Failed to connect to server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = startDate && endDate && startTime && endTime && !loading

  return (
    <div className="calculate-tab">
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="startTime">Start Time</label>
          <input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endTime">End Time</label>
          <input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      <button
        className="btn btn-primary btn-calculate"
        onClick={handleCalculate}
        disabled={!canSubmit}
      >
        {loading ? 'Calculating...' : 'Calculate'}
      </button>

      {error && <div className="error-msg">{error}</div>}

      {result && (
        <div className="result-card">
          <h3>Result</h3>
          <div className="result-grid">
            <div className="result-item">
              <span className="result-value">
                {result.totalHours}h {result.totalMinutes}m
              </span>
              <span className="result-label">Total Duration</span>
            </div>
            <div className="result-item">
              <span className="result-value">{result.workingDays}</span>
              <span className="result-label">Working Days</span>
            </div>
            <div className="result-item">
              <span className="result-value">{result.holidaysCount}</span>
              <span className="result-label">Holidays</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
