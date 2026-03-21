import { useState, useEffect } from 'react'
// Use Vite dev-server proxy (/api -> http://localhost:8000)
const API = '/api'

const fallback = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2847, change: 1.4, exchange: 'NSE' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3910, change: 2.1, exchange: 'NSE' },
  { symbol: 'INFY', name: 'Infosys', price: 1523, change: -0.8, exchange: 'NSE' },
  { symbol: 'HDFC BANK', name: 'HDFC Bank', price: 1682, change: 0.5, exchange: 'NSE' },
  { symbol: 'WIPRO', name: 'Wipro Limited', price: 456, change: -1.2, exchange: 'NSE' },
  { symbol: 'BAJAJ FIN', name: 'Bajaj Finance', price: 6834, change: 3.1, exchange: 'NSE' },
  { symbol: 'ICICI BANK', name: 'ICICI Bank', price: 1124, change: 0.9, exchange: 'NSE' },
]

function MiniChart({ up }) {
  const pts = up ? '0,30 20,25 40,28 60,18 80,15 100,8 120,5' : '0,5 20,10 40,8 60,18 80,22 100,26 120,30'
  return <svg width="80" height="30" viewBox="0 0 120 35"><polyline points={pts} fill="none" stroke={up ? '#06d6a0' : '#f43f5e'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

export default function Stocks() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadStocks = () => {
    fetch(`${API}/stocks`)
      .then(r => r.json())
      .then(d => setStocks(d.stocks?.length ? d.stocks : fallback))
      .catch(() => setStocks(fallback))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadStocks()
    const timer = setInterval(loadStocks, 30000)
    return () => clearInterval(timer)
  }, [])

  const filtered = stocks.filter(s => s.symbol?.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase()))
  const gainers = stocks.filter(s => s.change > 0).sort((a, b) => b.change - a.change).slice(0, 3)
  const losers = stocks.filter(s => s.change < 0).sort((a, b) => a.change - b.change).slice(0, 3)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <div className="page-enter" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', marginBottom: 4 }}>Live Stocks</h1>
        <p style={{ color: 'var(--text2)' }}>Real-time NSE & BSE market data</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {[{ title: '▲ Top Gainers', color: 'var(--success)', data: gainers, sign: '+' }, { title: '▼ Top Losers', color: 'var(--danger)', data: losers, sign: '' }].map((g, gi) => (
          <div key={gi} className="card page-enter" style={{ animationDelay: `${gi * 0.1}s` }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: g.color, marginBottom: 12 }}>{g.title}</p>
            {g.data.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < g.data.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>{s.symbol}</span>
                <span style={{ fontSize: 14, color: g.color, fontWeight: 500 }}>{g.sign}{s.change}%</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="page-enter page-enter-delay-2" style={{ marginBottom: '1.5rem' }}>
        <input className="input" placeholder="🔍  Search stocks..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card page-enter page-enter-delay-3" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              {['Symbol', 'Name', 'Price', 'Change', 'Exchange', 'Chart'].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: 'var(--text2)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [1,2,3].map(i => <tr key={i}><td colSpan={6} style={{ padding: '14px 20px' }}><div className="skeleton" style={{ height: 20 }} /></td></tr>) :
              filtered.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.2s ease', animation: `fadeInUp 0.4s ease ${i * 0.05}s both`, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 20px' }}><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{s.symbol}</span></td>
                  <td style={{ padding: '14px 20px', color: 'var(--text2)', fontSize: 14 }}>{s.name}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--font-display)', fontWeight: 600 }}>₹{s.price?.toLocaleString()}</td>
                  <td style={{ padding: '14px 20px' }}><span className={s.change >= 0 ? 'badge badge-green' : 'badge badge-red'}>{s.change >= 0 ? '+' : ''}{s.change}%</span></td>
                  <td style={{ padding: '14px 20px', color: 'var(--text3)', fontSize: 13 }}>{s.exchange}</td>
                  <td style={{ padding: '14px 20px' }}><MiniChart up={s.change >= 0} /></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}