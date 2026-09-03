import { useState } from 'react'

const AUTH_URL = `${import.meta.env.VITE_API_URL || ''}/api/auth`

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/login' : '/register'
      const res = await fetch(`${AUTH_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Something went wrong')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onLogin(data.user)
    } catch {
      setError('Failed to connect to auth server. Is it running?')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (m) => {
    setMode(m)
    setError('')
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <aside className="auth-brand">
          <div className="brand-logo">⇄</div>
          <h2 className="brand-title">Shift Manager</h2>
          <p className="brand-tagline">
            Track working time across shifts and holidays with ease.
          </p>
          <ul className="brand-features">
            <li>Working shift configuration</li>
            <li>Weekly holiday management</li>
            <li>Accurate time calculation</li>
          </ul>
        </aside>

        <div className="auth-panel">
          <div className="auth-mode-tabs">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => switchMode('login')}
            >
              Sign In
            </button>
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => switchMode('register')}
            >
              Register
            </button>
          </div>

          <div className="auth-body">
            <h1 className="auth-heading">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="auth-subheading">
              {mode === 'login'
                ? 'Enter your details to access your dashboard'
                : 'Fill in your details to get started'}
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="field">
                <label htmlFor="authEmail">Email address</label>
                <div className="input-wrap">
                  <span className="input-icon">@</span>
                  <input
                    id="authEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="authPassword">Password</label>
                <div className="input-wrap">
                  <span className="input-icon">*</span>
                  <input
                    id="authPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div className="field">
                  <label htmlFor="authConfirm">Confirm password</label>
                  <div className="input-wrap">
                    <span className="input-icon">*</span>
                    <input
                      id="authConfirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
              )}

              {error && <div className="error-msg">{error}</div>}

              <button
                className="btn btn-primary btn-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'login'
                    ? 'Sign In'
                    : 'Create Account'}
              </button>
            </form>

            <p className="auth-alt">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                className="link"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? 'Register now' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
