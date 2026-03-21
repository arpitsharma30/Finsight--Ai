import { useState } from 'react'

const API = '/api'

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/signup'
      const body = mode === 'login' ? { email, password } : { name, email, password }
      const res = await fetch(`${API}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Authentication failed')
      onAuthSuccess(data.token, data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '4rem 2rem' }}>
      <div className="card page-enter">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, marginBottom: 8 }}>
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p style={{ color: 'var(--text2)', marginBottom: '1.25rem' }}>
          Sign in to access your personal portfolio, goals, and advisory dashboard.
        </p>
        <form onSubmit={submit} style={{ display: 'grid', gap: '0.9rem' }}>
          {mode === 'signup' && (
            <input className="input" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
          )}
          <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>}
          <button className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <button
          className="btn btn-ghost"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          style={{ marginTop: '0.8rem', width: '100%', justifyContent: 'center' }}
        >
          {mode === 'login' ? 'New user? Create account' : 'Already have account? Login'}
        </button>
      </div>
    </div>
  )
}

