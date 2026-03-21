import { useState, useEffect } from 'react'
// Use Vite dev-server proxy (/api -> http://localhost:8000)
const API = '/api'

export default function Dashboard({ navigate, user, startOnboarding, token }) {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`${API}/stocks`).then(r => r.json()).then(d => { setStocks(d.stocks || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!token) return
    fetch(`${API}/user/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData(null))
  }, [token])

  const fallback = (stocks?.length ? stocks : [
    { symbol: 'RELIANCE', price: 2847, change: 1.4, exchange: 'NSE' },
    { symbol: 'TCS', price: 3910, change: 2.1, exchange: 'NSE' },
    { symbol: 'INFY', price: 1523, change: -0.8, exchange: 'NSE' },
    { symbol: 'HDFCBANK', price: 1682, change: 0.5, exchange: 'NSE' },
    { symbol: 'WIPRO', price: 456, change: -1.2, exchange: 'NSE' },
  ]).slice(0, 5)

  const portfolio = data?.portfolio
  const totalValue = portfolio?.total_value || 0
  const totalGain = portfolio?.total_gain || 0
  const gainPct = portfolio?.gain_pct || 0
  const profile = data?.profile

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <div className="page-enter" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', marginBottom: 4 }}>Good morning, {user?.name || 'Investor'} 👋</h1>
        <p style={{ color: 'var(--text2)' }}>Here's your financial overview for today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Portfolio Value', value: `₹${totalValue.toLocaleString()}`, sub: `${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(1)}% total return`, color: 'var(--accent)' },
          { label: 'Total Gain', value: `${totalGain >= 0 ? '+' : ''}₹${Math.abs(totalGain).toLocaleString()}`, sub: 'Since onboarding', color: totalGain >= 0 ? 'var(--success)' : 'var(--danger)' },
          { label: 'Risk Profile', value: profile?.risk_level || 'Not Set', sub: `${profile?.experience || 'Beginner'} investor` },
          { label: 'Monthly Savings', value: `₹${Number(profile?.monthly_savings || 0).toLocaleString()}`, sub: profile?.goal || 'Long-term wealth' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ animation: `fadeInUp 0.5s ease ${i * 0.1}s both` }}>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: s.color || 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>{s.value}</p>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          <div className="card page-enter page-enter-delay-2" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: '1rem' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {[
                { label: 'View Portfolio', icon: '◈', page: 'portfolio', color: '#7c3aed' },
                { label: 'Live Stocks', icon: '◎', page: 'stocks', color: '#4f8ef7' },
                { label: 'Take Quiz', icon: '◇', page: 'quiz', color: '#fbbf24' },
                { label: 'AI Chat', icon: '◉', page: 'chat', color: '#06d6a0' },
              ].map(a => (
                <button key={a.page} onClick={() => navigate(a.page)} style={{ background: `${a.color}12`, border: `1px solid ${a.color}30`, borderRadius: 14, padding: '1.25rem', cursor: 'pointer', transition: 'all 0.25s ease', textAlign: 'left', color: 'var(--text)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = `${a.color}20` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = `${a.color}12` }}
                >
                  <div style={{ fontSize: 22, color: a.color, marginBottom: 8 }}>{a.icon}</div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, margin: 0 }}>{a.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card page-enter page-enter-delay-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, margin: 0 }}>Top Stocks</h2>
              <button onClick={() => navigate('stocks')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-display)' }}>View all →</button>
            </div>
            {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />) :
              fallback.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 4 ? '1px solid var(--card-border)' : 'none', animation: `slideInLeft 0.4s ease ${i * 0.08}s both` }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, margin: 0 }}>{s.symbol}</p>
                    <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>{s.exchange || 'NSE'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, margin: 0 }}>₹{Number(s.price || 0).toLocaleString()}</p>
                    <p style={{ fontSize: 13, color: Number(s.change || 0) >= 0 ? 'var(--success)' : 'var(--danger)', margin: 0 }}>{Number(s.change || 0) >= 0 ? '+' : ''}{Number(s.change || 0).toFixed(2)}%</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card page-enter page-enter-delay-1">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: '1rem' }}>Allocation</h2>
            <svg width="100%" height="140" viewBox="0 0 200 140">
              <circle cx="100" cy="70" r="50" fill="none" stroke="rgba(79,142,247,0.15)" strokeWidth="20"/>
              <circle cx="100" cy="70" r="50" fill="none" stroke="#4f8ef7" strokeWidth="20" strokeDasharray="110 204" strokeDashoffset="0" strokeLinecap="round"/>
              <circle cx="100" cy="70" r="50" fill="none" stroke="#7c3aed" strokeWidth="20" strokeDasharray="88 204" strokeDashoffset="-110" strokeLinecap="round"/>
              <circle cx="100" cy="70" r="50" fill="none" stroke="#06d6a0" strokeWidth="20" strokeDasharray="70 204" strokeDashoffset="-198" strokeLinecap="round"/>
              <text x="100" y="66" textAnchor="middle" fontFamily="Syne" fontWeight="700" fontSize="20" fill="white">₹12.4K</text>
              <text x="100" y="82" textAnchor="middle" fontSize="11" fill="#8a9cc5">Portfolio</text>
            </svg>
            {[
              { name: 'RELIANCE', pct: '35%', color: '#4f8ef7' },
              { name: 'TCS', pct: '28%', color: '#7c3aed' },
              { name: 'INFY', pct: '22%', color: '#06d6a0' },
              { name: 'Others', pct: '15%', color: '#fbbf24' },
            ].map(h => (
              <div key={h.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: h.color }} />
                <span style={{ fontSize: 13, color: 'var(--text2)', flex: 1 }}>{h.name}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{h.pct}</span>
              </div>
            ))}
          </div>

          <div className="card page-enter page-enter-delay-2" style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.08), rgba(124,58,237,0.08))', borderColor: 'rgba(79,142,247,0.2)' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ fontSize: 24 }}>💡</div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--accent)', marginBottom: 4 }}>Daily Tip</p>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>{portfolio?.ai_tip || 'The SIP strategy — investing a fixed amount monthly — reduces market volatility impact through rupee cost averaging.'}</p>
              </div>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={startOnboarding}>Set up another user</button>
        </div>
      </div>
    </div>
  )
}