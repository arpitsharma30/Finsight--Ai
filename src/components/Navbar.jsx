import { useState, useEffect } from 'react'

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'chat', label: 'AI Chat' },
]

export default function Navbar({ page, navigate, user, startOnboarding, logout }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 72,
      background: scrolled ? 'rgba(2,9,23,0.85)' : 'rgba(2,9,23,0.6)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--card-border)',
      transition: 'all 0.4s ease',
      display: 'flex', alignItems: 'center', padding: '0 2rem',
    }}>
      <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => navigate('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(79,142,247,0.4)'
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L15.5 5.75V12.25L9 16L2.5 12.25V5.75L9 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="9" cy="9" r="2.5" fill="white"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>
            FinSight<span style={{ color: 'var(--accent)' }}> AI</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => navigate(item.id)} style={{
              background: page === item.id ? 'rgba(79,142,247,0.12)' : 'transparent',
              border: page === item.id ? '1px solid rgba(79,142,247,0.25)' : '1px solid transparent',
              color: page === item.id ? 'var(--accent)' : 'var(--text2)',
              borderRadius: 10, padding: '8px 16px',
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14,
              cursor: 'pointer', transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => { if (page !== item.id) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--card)' }}}
            onMouseLeave={e => { if (page !== item.id) { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.background = 'transparent' }}}
            >{item.label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-ghost" onClick={startOnboarding} style={{ fontSize: 12, padding: '7px 12px' }}>
            Update Profile
          </button>
          <button className="btn btn-ghost" onClick={logout} style={{ fontSize: 12, padding: '7px 12px' }}>
            Logout
          </button>
          <div title={user?.name || 'User'} style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'white',
          }}>{(user?.name || 'RS').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase()}</div>
        </div>
      </div>
    </nav>
  )
}