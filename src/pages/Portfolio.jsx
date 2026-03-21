import { useState, useEffect } from 'react'
// Use Vite dev-server proxy (/api -> http://localhost:8000)
const API = '/api'
const colors = ['#4f8ef7', '#7c3aed', '#06d6a0', '#fbbf24', '#f43f5e']

const fallback = {
  total_value: 12450, total_gain: 1340, gain_pct: 12.06,
  holdings: [
    { symbol: 'RELIANCE', name: 'Reliance Industries', qty: 2, buy_price: 2600, current_price: 2847, gain_pct: 9.5, value: 5694, allocation: 45.7 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', qty: 1, buy_price: 3500, current_price: 3910, gain_pct: 11.7, value: 3910, allocation: 31.4 },
    { symbol: 'INFY', name: 'Infosys', qty: 1, buy_price: 1600, current_price: 1523, gain_pct: -4.8, value: 1523, allocation: 12.2 },
    { symbol: 'HDFC BANK', name: 'HDFC Bank', qty: 1, buy_price: 1500, current_price: 1682, gain_pct: 12.1, value: 1682, allocation: 13.5 },
  ]
}

export default function Portfolio({ user, token, navigate }) {
  const [p, setP] = useState(fallback)
  const [loading, setLoading] = useState(true)
  const circumference = 2 * Math.PI * 55
  const [form, setForm] = useState({ symbol: '', name: '', qty: '', buy_price: '' })

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back()
      return
    }
    navigate?.('dashboard')
  }

  useEffect(() => {
    if (!token) return
    fetch(`${API}/user/portfolio`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setP(d.holdings ? d : fallback))
      .catch(() => setP(fallback))
      .finally(() => setLoading(false))
  }, [token])

  const addHolding = async (e) => {
    e.preventDefault()
    if (!form.symbol || !form.name || !form.qty || !form.buy_price) return
    await fetch(`${API}/user/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        symbol: form.symbol,
        name: form.name,
        qty: Number(form.qty),
        buy_price: Number(form.buy_price),
        exchange: 'NSE',
      }),
    })
    setForm({ symbol: '', name: '', qty: '', buy_price: '' })
    setLoading(true)
    fetch(`${API}/user/portfolio`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setP(d.holdings ? d : fallback))
      .catch(() => setP(fallback))
      .finally(() => setLoading(false))
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <button className="btn btn-ghost" onClick={goBack} style={{ marginBottom: '1rem' }}>
        ← Back
      </button>
      <div className="page-enter" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', marginBottom: 4 }}>{user?.name ? `${user.name}'s Portfolio` : 'My Portfolio'}</h1>
        <p style={{ color: 'var(--text2)' }}>Track your investments and performance 📈</p>
      </div>

      <form onSubmit={addHolding} className="card" style={{ marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
        <label><p style={{ fontSize: 12, marginBottom: 4, color: 'var(--text2)' }}>Symbol</p><input className="input" value={form.symbol} onChange={e => setForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))} /></label>
        <label><p style={{ fontSize: 12, marginBottom: 4, color: 'var(--text2)' }}>Name</p><input className="input" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} /></label>
        <label><p style={{ fontSize: 12, marginBottom: 4, color: 'var(--text2)' }}>Qty</p><input className="input" type="number" step="0.01" value={form.qty} onChange={e => setForm(prev => ({ ...prev, qty: e.target.value }))} /></label>
        <label><p style={{ fontSize: 12, marginBottom: 4, color: 'var(--text2)' }}>Buy Price</p><input className="input" type="number" step="0.01" value={form.buy_price} onChange={e => setForm(prev => ({ ...prev, buy_price: e.target.value }))} /></label>
        <button className="btn btn-primary" style={{ height: 44 }}>Add</button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Value', value: `₹${p.total_value?.toLocaleString()}`, color: 'var(--accent)', grad: true },
          { label: 'Total Gain', value: `+₹${p.total_gain?.toLocaleString()}`, color: 'var(--success)' },
          { label: 'Returns', value: `+${p.gain_pct?.toFixed(1)}%`, color: 'var(--success)' },
          { label: 'Holdings', value: `${p.holdings?.length || 0}`, color: 'var(--text)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ animation: `fadeInUp 0.5s ease ${i * 0.1}s both`, background: s.grad ? 'linear-gradient(135deg, rgba(79,142,247,0.12), rgba(124,58,237,0.12))' : 'var(--card)', borderColor: s.grad ? 'rgba(79,142,247,0.2)' : 'var(--card-border)' }}>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: s.color, margin: 0, letterSpacing: '-0.02em' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card page-enter page-enter-delay-1" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--card-border)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, margin: 0 }}>Holdings</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                {['Stock', 'Qty', 'Buy Price', 'Current', 'Value', 'P&L'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: 'var(--text2)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(p.holdings || []).map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.2s ease', animation: `fadeInUp 0.4s ease ${i * 0.08}s both` }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, margin: 0 }}>{h.symbol}</p>
                    <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>{h.name}</p>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14 }}>{h.qty}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text2)' }}>₹{h.buy_price?.toLocaleString()}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-display)', fontWeight: 600 }}>₹{h.current_price?.toLocaleString()}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-display)', fontWeight: 600 }}>₹{h.value?.toLocaleString()}</td>
                  <td style={{ padding: '14px 16px' }}><span className={h.gain_pct >= 0 ? 'badge badge-green' : 'badge badge-red'}>{h.gain_pct >= 0 ? '+' : ''}{h.gain_pct?.toFixed(1)}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card page-enter page-enter-delay-2">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: '1.5rem' }}>Allocation</h2>
          <svg width="100%" height="160" viewBox="0 0 200 160" style={{ display: 'block', margin: '0 auto 1rem' }}>
            {(p.holdings || []).reduce((acc, h, i) => {
              const dash = ((h.allocation || 0) / 100) * circumference
              acc.elements.push(<circle key={i} cx="100" cy="80" r="55" fill="none" stroke={colors[i % colors.length]} strokeWidth="22" strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={acc.offset} strokeLinecap="butt"/>)
              acc.offset -= dash
              return acc
            }, { offset: -circumference * 0.25, elements: [] })?.elements}
            <text x="100" y="75" textAnchor="middle" fontFamily="Syne" fontWeight="800" fontSize="18" fill="white">₹{((p.total_value || 0) / 1000).toFixed(1)}K</text>
            <text x="100" y="92" textAnchor="middle" fontSize="11" fill="#8a9cc5">Total</text>
          </svg>
          {(p.holdings || []).map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, animation: `fadeInUp 0.4s ease ${i * 0.1}s both` }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors[i % colors.length], flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: 'var(--text2)', flex: 1 }}>{h.symbol}</span>
              <div style={{ flex: 1.5, background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                <div style={{ width: `${h.allocation || 0}%`, height: '100%', background: colors[i % colors.length], borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, minWidth: 36, textAlign: 'right' }}>{(h.allocation || 0).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}