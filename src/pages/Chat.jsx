import { useState, useRef, useEffect } from 'react'

// Use Vite dev-server proxy (/api -> http://localhost:8000) to avoid CORS/port mismatch.
const API = '/api'

const suggestions = [
  'How should a student start investing?',
  'What is SIP and how does it work?',
  'Explain mutual funds in simple terms',
  'Should I invest in gold or stocks?',
]

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm FinSight AI 👋 Your personal financial advisor. Ask me anything about investing, budgeting, stocks, or building wealth as a student!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || data.message || 'Sorry, something went wrong.' }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Connection failed: ${err.message}. Is the backend running?` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 72px)' }}>
      <div className="page-enter" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', marginBottom: 4 }}>AI Financial Advisor</h1>
        <p style={{ color: 'var(--text2)', fontSize: 15 }}>Powered by Groq — ask me anything about money 💬</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: 20, marginBottom: '1rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '1rem', animation: 'fadeInUp 0.3s ease both' }}>
            {m.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginRight: 10, flexShrink: 0, marginTop: 4 }}>◉</div>
            )}
            <div style={{ maxWidth: '72%', padding: '12px 16px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: m.role === 'user' ? 'linear-gradient(135deg, #4f8ef7, #7c3aed)' : 'rgba(255,255,255,0.06)', border: m.role === 'user' ? 'none' : '1px solid var(--card-border)', fontSize: 15, lineHeight: 1.6 }}>
              {m.content}
            </div>
            {m.role === 'user' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #06d6a0, #4f8ef7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'white', marginLeft: 10, flexShrink: 0, marginTop: 4 }}>RS</div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>◉</div>
            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--card-border)', borderRadius: '18px 18px 18px 4px' }}>
              <div className="loading-dots"><span/><span/><span/></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem', animation: 'fadeIn 0.5s ease 0.3s both' }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => send(s)} style={{ padding: '8px 14px', fontSize: 13, background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 20, color: 'var(--text2)', cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.color = 'var(--text2)' }}
            >{s}</button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <input className="input" placeholder="Ask about investing, stocks, budgeting..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} style={{ flex: 1, borderRadius: 14, padding: '14px 18px' }} />
        <button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim()} style={{ borderRadius: 14, padding: '14px 24px', opacity: loading || !input.trim() ? 0.5 : 1 }}>Send ↗</button>
      </div>
    </div>
  )
}