import { useState, useEffect } from 'react'
import SettingsTab from './components/SettingsTab'
import CalculateTab from './components/CalculateTab'
import Auth from './components/Auth'
import './App.css'

const SETTINGS_URL = `${import.meta.env.VITE_API_URL || ''}/settings`

function App() {
  const [activeTab, setActiveTab] = useState('calculate')
  const [holidays, setHolidays] = useState(['saturday', 'sunday'])
  const [shiftConfig, setShiftConfig] = useState({
    shiftStart: '09:00',
    shiftEnd: '18:00',
  })

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem('user') || 'null')
  )

  const token = localStorage.getItem('token')

  // Load saved settings for the logged-in user
  useEffect(() => {
    if (!user || !token) return

    fetch(SETTINGS_URL, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setShiftConfig(data.shiftConfig)
          setHolidays(data.holidays || [])
        }
      })
      .catch(() => {})
  }, [user, token])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (!user) {
    return <Auth onLogin={setUser} />
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-top">
          <h1>Office Shift Manager</h1>
          <div className="user-area">
            <span className="user-email">{user.email}</span>
            <button className="btn btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
        <p>Manage working shifts, holidays & calculate hours</p>
      </header>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'calculate' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculate')}
        >
          Calculate
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <main className="tab-content">
        {activeTab === 'calculate' && (
          <CalculateTab shiftConfig={shiftConfig} holidays={holidays} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            holidays={holidays}
            setHolidays={setHolidays}
            shiftConfig={shiftConfig}
            setShiftConfig={setShiftConfig}
            token={token}
          />
        )}
      </main>
    </div>
  )
}

export default App
